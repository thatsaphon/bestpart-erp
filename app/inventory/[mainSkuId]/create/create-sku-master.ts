'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const createSkuMaster = async (
    mainSkuId: number,
    data: Prisma.SkuMasterCreateWithoutMainSkuInput
) => {
    const result = await prisma.skuMaster.create({
        data: {
            ...data,
            mainSkuId,
            // MainSku: {
            //     connect: {
            //         id: mainSkuId,
            //     },
            // },
        },
    })

    revalidatePath(`/inventory/${mainSkuId}`)
    redirect(`/inventory/${mainSkuId}/${result.id}`)
}
