'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getSalesReturnDefaultFunction = async (
    where: Prisma.DocumentWhereInput
) => {
    return await prisma.document.findMany({
        where: where,
        include: {
            SalesReturn: {
                include: {
                    SalesReturnItem: {
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
                },
            },
            DocumentRemark: true,
        },
    })
}

export type GetSalesReturn = Awaited<
    ReturnType<typeof getSalesReturnDefaultFunction>
>[number]
