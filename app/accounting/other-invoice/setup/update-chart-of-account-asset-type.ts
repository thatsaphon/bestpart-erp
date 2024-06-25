'use server'

import prisma from '@/app/db/db'
import { $Enums } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const updateChartOfAccountAssetType = async (
    chartOfAccountId: number,
    assetType: $Enums.AssetType | 'none'
) => {
    const chartOfAccount = await prisma.chartOfAccount.findFirst({
        where: {
            id: chartOfAccountId,
        },
    })

    if (!chartOfAccount) {
        throw new Error('Chart of account not found')
    }
    if (assetType === 'none') {
        return await prisma.chartOfAccount.update({
            where: {
                id: chartOfAccountId,
            },
            data: {
                AssetTypeToChartOfAccount: {
                    delete: {},
                },
            },
        })
    }
    await prisma.chartOfAccount.update({
        where: {
            id: chartOfAccountId,
        },
        data: {
            AssetTypeToChartOfAccount: {
                upsert: {
                    where: {
                        id: chartOfAccountId,
                    },
                    create: {
                        AssetType: assetType,
                    },
                    update: {
                        AssetType: assetType,
                    },
                },
            },
        },
    })

    revalidatePath('/accounting/other-invoice/setup')
    revalidatePath('/accounting/other-invoice/create')
}
