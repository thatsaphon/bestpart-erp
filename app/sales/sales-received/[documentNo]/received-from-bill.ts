'use server'

import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import prisma from '@/app/db/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const receivedFromBill = async (
    billId: string,
    date: Date,
    amount: number,
    accountNumber: string,
    remark: string,
    handleDifference?: 'outstanding' | 'discount'
) => {
    const receivedId = await generateDocumentNumber('RV', date.toISOString())

    const bill = await prisma.document.findMany({
        where: { documentNo: billId },
        include: {
            GeneralLedger: {
                where: {
                    OR: [
                        { chartOfAccountId: 12000 },
                        { ChartOfAccount: { type: 'Assets' } },
                    ],
                },
            },
        },
    })

    if (amount > bill[0].GeneralLedger.reduce((a, b) => a + b.amount, 0)) {
        throw new Error('Amount cannot be greater than bill amount')
    }

    if (amount < bill[0].GeneralLedger.reduce((a, b) => a + b.amount, 0)) {
    }

    const received = await prisma.document.create({
        data: {
            documentNo: receivedId,
            date,
            address: bill[0].address,
            contactName: bill[0].contactName,
            phone: bill[0].phone,
            taxId: bill[0].taxId,
            remark: { create: { remark } },
            type: 'Received',
            GeneralLedger: {
                create: [
                    {
                        chartOfAccountId: +accountNumber,
                        amount: amount,
                    },
                    {
                        chartOfAccountId: 12000,
                        amount:
                            handleDifference === 'discount'
                                ? -bill[0].GeneralLedger.reduce(
                                      (a, b) => a + b.amount,
                                      0
                                  )
                                : -amount,
                    },
                    {
                        chartOfAccountId: 41100,
                        amount:
                            handleDifference === 'discount'
                                ? amount -
                                  bill[0].GeneralLedger.reduce(
                                      (a, b) => a + b.amount,
                                      0
                                  )
                                : 0,
                    },
                ].filter(({ amount }) => amount !== 0),
            },
        },
        select: {
            GeneralLedger: { where: { chartOfAccountId: 12000 } },
        },
    })

    const updateBill = await prisma.document.update({
        where: { documentNo: billId },
        data: {
            ArSubledger: {
                update: {
                    paymentStatus:
                        handleDifference === 'outstanding'
                            ? 'PartialPaid'
                            : 'Paid',
                },
            },
            GeneralLedger: {
                connect: {
                    id: received.GeneralLedger[0].id,
                },
            },
        },
    })

    revalidatePath('/sales/sales-bill')
    revalidatePath('/sales/sales-bill/' + billId)
}
