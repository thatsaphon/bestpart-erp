'use server'

import prisma from '@/app/db/db'

export const getUnpaidOtherInvoice = async (contactId: number) => {
    return prisma.document.findMany({
        where: {
            OtherInvoice: {
                contactId: contactId,
                GeneralLedger: {
                    some: {
                        ChartOfAccount: {
                            isAp: true,
                        },
                    },
                },
                otherPaymentId: null,
            },
        },
        include: {
            OtherInvoice: {
                include: {
                    OtherInvoiceItem: true,
                    GeneralLedger: {
                        include: {
                            ChartOfAccount: true,
                        },
                    },
                },
            },
        },
    })
}

export type GetUnpaidOtherInvoice = Awaited<
    ReturnType<typeof getUnpaidOtherInvoice>
>[number]
