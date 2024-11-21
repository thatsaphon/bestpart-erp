'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const updateSkuMaster = async (
    skuMasterId: number,
    data: Prisma.SkuMasterUpdateInput
) => {
    const result = await prisma.skuMaster.update({
        where: { id: skuMasterId },
        data,
    })

    revalidatePath(`/inventory/${result.mainSkuId}/${result.id}`)
}
