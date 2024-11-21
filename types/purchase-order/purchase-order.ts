'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getPurchaseOrderDefaultFunction = async (
    where: Prisma.DocumentWhereInput
) => {
    return await prisma.document.findMany({
        where: where,
        include: {
            PurchaseOrder: {
                include: {
                    Contact: true,
                    PurchaseOrderItem: {
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

export type GetPurchaseOrder = Awaited<
    ReturnType<typeof getPurchaseOrderDefaultFunction>
>[number]
