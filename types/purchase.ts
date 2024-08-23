'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getPurchaseDefaultFunction = async (
    where: Prisma.DocumentWhereInput
) => {
    return await prisma.document.findMany({
        where: where,
        include: {
            Purchase: {
                include: {
                    PurchaseItem: {
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
                },
            },
        },
    })
}

export type GetPurchase = Awaited<
    ReturnType<typeof getPurchaseDefaultFunction>
>[number]
