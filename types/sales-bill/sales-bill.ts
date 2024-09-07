import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getSalesBillDefaultFunction = async (
    where: Prisma.DocumentWhereInput
) => {
    return await prisma.document.findMany({
        where,
        include: {
            SalesBill: {
                include: {
                    Contact: true,
                    Sales: {
                        include: {
                            SalesItem: true,
                            Document: true,
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
                            Document: true,
                            GeneralLedger: {
                                include: {
                                    ChartOfAccount: true,
                                },
                            },
                        },
                    },
                    SalesReceived: {
                        include: {
                            Document: true,
                            GeneralLedger: {
                                include: {
                                    ChartOfAccount: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    })
}

export type getSalesBill = Awaited<
    ReturnType<typeof getSalesBillDefaultFunction>
>[number]
