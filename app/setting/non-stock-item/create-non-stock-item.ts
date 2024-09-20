'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const createNonStockItem = async (
    data: Prisma.ServiceAndNonStockItemCreateInput
) => {
    await prisma.serviceAndNonStockItem.create({ data })

    revalidatePath('/setting/non-stock-item')
}
