'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getSalesItemsDefaultFunction = async (
    where: Prisma.SalesItemWhereInput
) => {
    return await prisma.salesItem.findMany({
        where: where,
        include: {
            SkuMaster: {
                include: {
                    MainSku: true,
                },
            },
            GoodsMaster: true,
            ServiceAndNonStockItem: {
                include: {
                    ChartOfAccount: true,
                },
            },
        },
    })
}

export type GetSalesItems = Awaited<
    ReturnType<typeof getSalesItemsDefaultFunction>
>[number]
