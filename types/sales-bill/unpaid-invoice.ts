'use server'

import prisma from '@/app/db/db'

export const getUnpaidInvoices = async (contactId: number) => {
    return prisma.document.findMany({
        where: {
            OR: [
                {
                    Sales: {
                        contactId: contactId,
                        salesBillId: null,
                        salesReceivedId: null,
                    },
                },
                {
                    SalesReturn: {
                        contactId: contactId,
                        salesBillId: null,
                        salesReceivedId: null,
                    },
                },
            ],
        },
        include: {
            Sales: {
                include: {
                    SalesItem: true,
                    GeneralLedger: {
                        include: {
                            ChartOfAccount: true,
                        },
                    },
                },
            },
            SalesReturn: {
                include: {
                    SalesReturnItem: true,
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

export type getUnpaidInvoice = Awaited<
    ReturnType<typeof getUnpaidInvoices>
>[number]
