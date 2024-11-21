'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getAssetDefaultFunction = async (
    where: Prisma.AssetWhereInput
) => {
    return await prisma.asset.findMany({
        where: where,
        include: {
            AssetMovement: {
                include: {
                    OtherInvoice: {
                        include: {
                            Document: true,
                        },
                    },
                    JournalVoucher: {
                        include: {
                            Document: true,
                        },
                    },
                },
            },
        },
    })
}

export type GetAsset = Awaited<
    ReturnType<typeof getAssetDefaultFunction>
>[number]
