'use server'

import prisma from '@/app/db/db'

export default async function searchGoodsMasters(
    query: string,
    page: number = 1,
    limit: number = 10
) {
    const result = await prisma.mainSku.findMany({
        where: {
            name: {
                contains: query,
            },
        },
        include: {
            SkuMaster: {
                include: {
                    GoodsMaster: true,
                    Brand: true,
                    Image: true,
                    SkuIn: {
                        where: { remaining: { not: 0 } },
                    },
                },
            },
        },
    })

    return result
}
