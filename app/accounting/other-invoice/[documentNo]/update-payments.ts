'use server'

import { getApPaymentMethods } from '@/app/actions/accounting'
import prisma from '@/app/db/db'
import {
    calculateApPaymentStatus,
    calculateArPaymentStatus,
} from '@/lib/calculate-payment-status'
import { revalidatePath } from 'next/cache'

export const updateOtherInvoicePayments = async (
    id: number,
    payments: { id: number; amount: number }[]
) => {
    const paymentMethods = await getApPaymentMethods()
    const document = await prisma.document.findMany({
        where: { id },
        include: {
            SkuOut: true,
            GeneralLedger: true,
            ApSubledger: { include: { Contact: true } },
        },
    })

    if (!document.length) throw new Error('document not found')

    // if (
    //     payments.find((payment) => payment.id === 12000) &&
    //     (!document[0].ApSubledger?.Contact ||
    //         !document[0].ApSubledger?.Contact.credit)
    // ) {
    //     throw new Error(
    //         `${document[0].ApSubledger?.Contact.name || ''} ไม่สามารถขายเงินเชื่อได้`
    //     )
    // }

    if (
        document[0].GeneralLedger.filter(
            (gl) =>
                !paymentMethods
                    .map(({ id }) => id)
                    .includes(gl.chartOfAccountId)
        ).reduce((acc, { amount }) => acc + amount, 0) !==
        payments.reduce((acc, payment) => acc + payment.amount, 0)
    )
        throw new Error('จำนวนเงินไม่ถูกต้อง')
    const paymentStatus = await calculateApPaymentStatus(payments)

    await prisma.document.update({
        where: { id },
        data: {
            GeneralLedger: {
                deleteMany: [
                    {
                        chartOfAccountId: {
                            in: paymentMethods.map(({ id }) => id),
                        },
                    },
                ],
                create: payments.map((payment) => ({
                    chartOfAccountId: payment.id,
                    amount: -payment.amount,
                })),
            },
            ApSubledger: document[0].ApSubledger
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

    revalidatePath(`/accounting/other-invoice/${document[0].documentNo}`)
    revalidatePath(`/accounting/other-invoice`)
}
