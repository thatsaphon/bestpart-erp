import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getSalesReceivedDefaultFunction = async (
    where: Prisma.DocumentWhereInput
) => {
    return await prisma.document.findMany({
        where,
        include: {
            SalesReceived: {
                include: {
                    Contact: true,
                    Sales: {
                        include: {
                            SalesItem: true,
                            Document: true,
                            GeneralLedger: {
                                include: { ChartOfAccount: true },
                            },
                        },
                    },
                    SalesReturn: {
                        include: {
                            SalesReturnItem: true,
                            Document: true,
                            GeneralLedger: {
                                include: { ChartOfAccount: true },
                            },
                        },
                    },
                    SalesBill: {
                        include: {
                            Document: true,
                            Sales: {
                                include: {
                                    SalesItem: true,
                                    GeneralLedger: {
                                        include: { ChartOfAccount: true },
                                    },
                                },
                            },
                            SalesReturn: {
                                include: {
                                    SalesReturnItem: true,
                                    GeneralLedger: {
                                        include: { ChartOfAccount: true },
                                    },
                                },
                            },
                        },
                    },
                    GeneralLedger: {
                        include: {
                            ChartOfAccount: true,
                        },
                    },
                },
            },
            DocumentRemark: {
                include: {
                    User: true,
                },
            },
        },
    })
}

export type getSalesReceived = Awaited<
    ReturnType<typeof getSalesReceivedDefaultFunction>
>[number]
