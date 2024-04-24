'use server'

import prisma from '@/app/db/db'

export default async function searchGoodsMasters(
    query: string,
    page: string = '1',
    limit: string = '10'
) {
    // const result = await prisma.skuMaster.findMany({
    //     where: {
    //         mainSku: {
    //             name: {
    //                 contains: query,
    //             },
    //         },
    //     },
    //     include: {
    //         brand: true,
    //         images: true,
    //         goodsMasters: true,
    //         mainSku: true,
    //     },

    //     skip: (+page - 1) * +limit,
    //     take: +limit,
    // })

    // const result = await prisma.goodsMaster.findMany({
    //     where: {
    //         sku: { mainSku: { name: { contains: query } } },
    //     },
    //     include: {
    //         sku: {
    //             include: {
    //                 brand: true,
    //                 images: true,
    //                 mainSku: {
    //                     include: { carModel: true },
    //                 },
    //                 skuMovements: true,
    //             },
    //         },
    //     },
    // })

    const result = await prisma.mainSku.findMany({
        where: {
            name: {
                contains: query,
            },
        },
        include: {
            skuMasters: {
                include: {
                    goodsMasters: true,
                    brand: true,
                    images: true,
                    skuMovements: true,
                },
            },
        },
    })

    return result
}
