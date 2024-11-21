'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const updateMainSku = async (
    mainSkuId: number,
    data: Prisma.MainSkuUpdateInput
) => {
    const mainSku = await prisma.mainSku.update({
        where: {
            id: mainSkuId,
        },
        data: data,
    })

    revalidatePath(`/inventory/${mainSkuId}`)
}
