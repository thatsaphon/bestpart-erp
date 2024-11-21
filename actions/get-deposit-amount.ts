'use server'

import prisma from '@/app/db/db'

export const getDepositAmount = async (
    contactId: number,
    exclude: {
        customerOrderIds?: number[]
        salesIds?: number[]
        salesReceivedIds?: number[]
    } = {}
) => {
    if (!contactId) return 0

    const deposits = await prisma.generalLedger.findMany({
        where: {
            ChartOfAccount: {
                isDeposit: true,
            },
            OR: [
                {
                    CustomerOrder: {
                        contactId,
                        id: {
                            notIn: exclude.customerOrderIds,
                        },
                    },
                },
                {
                    Sales: {
                        contactId,
                        id: {
                            notIn: exclude.salesIds,
                        },
                    },
                },
                {
                    SalesReceived: {
                        contactId,
                        id: {
                            notIn: exclude.salesReceivedIds,
                        },
                    },
                },
            ],
        },
    })

    return -deposits.reduce((total, deposit) => total + deposit.amount, 0)
}
