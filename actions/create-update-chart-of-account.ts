'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const createChartOfAccount = async (
    data: Prisma.ChartOfAccountCreateInput
) => {
    await prisma.chartOfAccount.create({
        data: data,
    })
}

export const updateChartOfAccount = async (
    id: number,
    data: Prisma.ChartOfAccountUpdateInput
) => {
    const result = await prisma.chartOfAccount.update({
        where: {
            id: id,
        },
        data: data,
    })
    revalidatePath('/accounting/chart-of-account')
    return result
}
