import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const addAssetMovement = async (
    assetId: number,
    movementDetail: Prisma.AssetMovementCreateInput
) => {
    await prisma.assetMovement.create({
        data: movementDetail,
    })
    revalidatePath(`/accounting/asset-management/${assetId}`)
}
