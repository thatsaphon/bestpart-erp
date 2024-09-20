'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getServiceAndNonStockItemsDefaultFunction = async (
    where: Prisma.ServiceAndNonStockItemWhereInput
) => {
    return await prisma.serviceAndNonStockItem.findMany({ where })
}

export type GetServiceAndNonStockItem = Awaited<
    ReturnType<typeof getServiceAndNonStockItemsDefaultFunction>
>[number]
