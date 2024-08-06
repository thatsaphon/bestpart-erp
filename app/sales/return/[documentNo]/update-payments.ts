'use server'

import prisma from '@/app/db/db'
import { calculateArPaymentStatus } from '@/lib/calculate-payment-status'
import { revalidatePath } from 'next/cache'

export const updatePayments = async (
    id: number,
    payments: { id: number; amount: number }[]
) => {
    const document = await prisma.document.findMany({
        where: { id },
        include: {
            SkuOut: true,
            GeneralLedger: true,
            ArSubledger: { include: { Contact: true } },
        },
    })

    if (!document.length) throw new Error('document not found')

    if (
        payments.find((payment) => payment.id === 12000) &&
        (!document[0].ArSubledger?.Contact ||
            !document[0].ArSubledger?.Contact.credit)
    ) {
        throw new Error(
            `${document[0].ArSubledger?.Contact.name || ''} ไม่สามารถขายเงินเชื่อได้`
        )
    }

    if (
        document[0].SkuOut.reduce(
            (acc, skuOut) =>
                acc + skuOut.quantity * (skuOut.price + skuOut.vat),
            0
        ) !== payments.reduce((acc, payment) => acc + payment.amount, 0)
    )
        throw new Error('จำนวนเงินไม่ถูกต้อง')
    const paymentStatus = await calculateArPaymentStatus(payments)

    await prisma.document.update({
        where: { id },
        data: {
            GeneralLedger: {
                deleteMany: [
                    {
                        AND: { chartOfAccountId: { gte: 11000 } },
                        chartOfAccountId: { lte: 12000 },
                    },
                ],
                create: payments.map((payment) => ({
                    chartOfAccountId: payment.id,
                    amount: payment.amount,
                })),
            },
            ArSubledger: document[0].ArSubledger
                ? {
                      update: {
                          data: {
                              paymentStatus,
                          },
                      },
                  }
                : undefined,
        },
    })

    revalidatePath(`/sales/sales-order/${document[0].documentNo}`)
    revalidatePath(`/sales/sales-order`)
}
