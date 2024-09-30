'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const createAsset = async (assetDetail: Prisma.AssetCreateInput) => {
    await prisma.asset.create({
        data: assetDetail,
    })

    revalidatePath('/accounting/asset-management')
}
