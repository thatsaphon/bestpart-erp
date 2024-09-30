'use server'

import prisma from '@/app/db/db'
import { Asset, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const updateAsset = async (
    id: number,
    assetDetail: Prisma.AssetUpdateInput
) => {
    await prisma.asset.update({
        where: {
            id: id,
        },
        data: assetDetail,
    })

    revalidatePath('/accounting/asset-management' + id)
}
