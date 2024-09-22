'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getSalesDefaultFunction = async (
    where: Prisma.DocumentWhereInput
) => {
    return await prisma.document.findMany({
        where: where,
        include: {
            Sales: {
                include: {
                    SalesItem: {
                        include: {
                            SkuMaster: {
                                include: {
                                    MainSku: {
                                        include: {
                                            MainSkuRemark: true,
                                        },
                                    },
                                    SkuMasterRemark: true,
                                    Image: true,
                                },
                            },
                            GoodsMaster: true,
                            ServiceAndNonStockItem: {
                                include: {
                                    ChartOfAccount: true,
                                },
                            },
                        },
                    },
                    GeneralLedger: { include: { ChartOfAccount: true } },
                    CustomerOrder: true,
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

export type GetSales = Awaited<
    ReturnType<typeof getSalesDefaultFunction>
>[number]
