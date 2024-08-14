'use server'

import prisma from '@/app/db/db'

export const getSkuMasterQuantity = async (skuMasterIds: number[]) => {
    const result = skuMasterIds.map((id) => ({
        skuMasterId: id,
        remaining: 0,
        remainingAt: new Date(),
    }))

    const data = await prisma.skuMaster.findMany({
        where: {
            id: {
                in: skuMasterIds,
            },
        },
        include: {
            SkuIn: {
                where: {},
            },
            SkuOut: true,
        },
    })
}
