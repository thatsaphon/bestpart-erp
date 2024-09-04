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
                },
            },
            SalesReturn: {
                include: {
                    SalesReturnItem: true,
                },
            },
        },
    })
}

export type getUnpaidInvoice = Awaited<
    ReturnType<typeof getUnpaidInvoices>
>[number]
