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
                    Image: true,
                    SkuIn: {
                        include: {
                            SkuInToOut: true,
                        }
                    },
                },
            },
        },
    })

    return result
}
