'use server'

import prisma from '@/app/db/db'

export async function getPaymentMethods() {
    return await prisma.chartOfAccount.findMany({
        where: {
            OR: [
                {
                    isAr: true,
                },
                {
                    isCash: true,
                },
                {
                    isDeposit: true,
                },
            ],
        },
        select: {
            id: true,
            name: true,
            type: true,
            isAr: true,
            isCash: true,
            isDeposit: true,
        },
    })
}