'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getPurchaseReturnDefaultFunction = async (
    where: Prisma.DocumentWhereInput
) => {
    return await prisma.document.findMany({
        where: where,
        include: {
            PurchaseReturn: {
                include: {
                    PurchaseReturnItem: {
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
            DocumentRemark: {
                include: {
                    User: true,
                },
            },
        },
    })
}

export type GetPurchaseReturn = Awaited<
    ReturnType<typeof getPurchaseReturnDefaultFunction>
>[number]
