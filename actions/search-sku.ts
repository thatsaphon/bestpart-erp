'use server'

import prisma from '@/app/db/db'
import { MainSkuRemark, Prisma, SkuMasterRemark } from '@prisma/client'
import { InventoryDetailType } from '@/types/inventory-detail'

export const searchSku = async (query: string, page: number = 1) => {
    const splitQuery = query.trim().split(' ')

    const items = await prisma.goodsMaster.findMany({
        where: {
            AND: [
                ...splitQuery.map((q) => ({
                    OR: [
                        { barcode: { contains: q, mode: 'insensitive' } },
                        {
                            SkuMaster: {
                                detail: {
                                    contains: q,
                                    mode: 'insensitive',
                                },
                            },
                        },
                        {
                            SkuMaster: {
                                SkuMasterRemark: {
                                    some: {
                                        name: {
                                            contains: q,
                                            mode: 'insensitive',
                                        },
                                    },
                                },
                            },
                        },
                        {
                            SkuMaster: {
                                MainSku: {
                                    name: {
                                        contains: q,
                                        mode: 'insensitive',
                                    },
                                },
                            },
                        },
                        {
                            SkuMaster: {
                                MainSku: {
                                    partNumber: {
                                        contains: q,
                                        mode: 'insensitive',
                                    },
                                },
                            },
                        },
                        {
                            SkuMaster: {
                                MainSku: {
                                    MainSkuRemark: {
                                        some: {
                                            name: {
                                                contains: q,
                                                mode: 'insensitive',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    ] as unknown as {}[],
                })),
            ],
        },
        include: {
            SkuMaster: {
                include: {
                    MainSku: { include: { MainSkuRemark: true } },
                    Image: true,
                    SkuMasterRemark: true,
                },
            },
        },
        skip: (page - 1) * 10,
        take: 10,
        orderBy: { SkuMaster: { MainSku: { name: 'asc' } } },
    })
    const count = await prisma.goodsMaster.count({
        where: {
            AND: [
                ...splitQuery.map((q) => ({
                    OR: [
                        { barcode: { contains: q, mode: 'insensitive' } },
                        {
                            SkuMaster: {
                                detail: {
                                    contains: q,
                                    mode: 'insensitive',
                                },
                            },
                        },
                        {
                            SkuMaster: {
                                SkuMasterRemark: {
                                    some: {
                                        name: {
                                            contains: q,
                                            mode: 'insensitive',
                                        },
                                    },
                                },
                            },
                        },
                        {
                            SkuMaster: {
                                MainSku: {
                                    name: {
                                        contains: q,
                                        mode: 'insensitive',
                                    },
                                },
                            },
                        },
                        {
                            SkuMaster: {
                                MainSku: {
                                    partNumber: {
                                        contains: q,
                                        mode: 'insensitive',
                                    },
                                },
                            },
                        },
                        {
                            SkuMaster: {
                                MainSku: {
                                    MainSkuRemark: {
                                        some: {
                                            name: {
                                                contains: q,
                                                mode: 'insensitive',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    ] as unknown as {}[],
                })),
            ],
        },
    })

    const remaining = await prisma.stockMovement.groupBy({
        by: ['skuMasterId'],
        where: { skuMasterId: { in: items.map((item) => item.skuMasterId) } },
        _sum: {
            quantity: true,
        },
    })
    return {
        items: items.map((goods) => ({
            mainSkuId: goods.SkuMaster.mainSkuId,
            goodsMasterId: goods.id,
            barcode: goods.barcode,
            skuMasterId: goods.skuMasterId,
            name: goods.SkuMaster.MainSku.name,
            detail: goods.SkuMaster.detail,
            unit: goods.unit,
            quantityPerUnit: goods.quantityPerUnit,
            quantity: 0,
            pricePerUnit: goods.quantityPerUnit,
            partNumber: goods.SkuMaster.MainSku.partNumber || '',
            remaining:
                remaining.find((r) => r.skuMasterId === goods.skuMasterId)?._sum
                    .quantity || 0,
            images: goods.SkuMaster.Image,
            MainSkuRemarks: goods.SkuMaster.MainSku.MainSkuRemark,
            SkuMasterRemarks: goods.SkuMaster.SkuMasterRemark,
        })),
        count,
    }
    // const result: InventoryDetailType[] = []

    // const items = await prisma.$queryRawUnsafe<InventoryDetailType[]>(
    //     `select "MainSku".id as "mainSkuId", "GoodsMaster".id as "goodsMasterId", "GoodsMaster".barcode, "SkuMaster"."id" as "skuMasterId",
    //     "MainSku"."name", "SkuMaster"."detail", "GoodsMaster"."pricePerUnit",
    // "GoodsMaster"."quantityPerUnit", "GoodsMaster".unit, "MainSku"."partNumber"
    // from "MainSku"
    // left join "SkuMaster" on "MainSku"."id" = "SkuMaster"."mainSkuId"
    // left join "GoodsMaster" on "SkuMaster"."id" = "GoodsMaster"."skuMasterId"
    // left join "_MainSkuToMainSkuRemark" on "MainSku"."id" = "_MainSkuToMainSkuRemark"."A"
    // left join "MainSkuRemark" on "_MainSkuToMainSkuRemark"."B" = "MainSkuRemark"."id"
    // left join "_SkuMasterToSkuMasterRemark" on "SkuMaster"."id" = "_SkuMasterToSkuMasterRemark"."A"
    // left join "SkuMasterRemark" on "_SkuMasterToSkuMasterRemark"."B" = "SkuMasterRemark"."id"
    // ${query ? `where ` : ` `}
    // ${splitQuery
    //     .map((x, index) =>
    //         x.trim()
    //             ? `(LOWER("MainSku"."name") like $${index + 1} or LOWER("SkuMaster"."detail") like $${index + 1} or
    // LOWER("GoodsMaster"."barcode") like $${index + 1} or LOWER("MainSku"."searchKeyword") like $${index + 1} or
    //  LOWER("SkuMasterRemark"."name") like $${index + 1} or LOWER("MainSkuRemark"."name") like $${index + 1})`
    //             : ``
    //     )
    //     .join(' and ')}
    //     order by "MainSku"."name"
    // limit 10 offset ${(page - 1) * 10}
    // `,
    //     ...splitQuery.map((x) => `%${x.toLowerCase()}%`)
    // )
    // if (!items.length) throw new Error('ไม่พบสินค้าที่ค้นหา')
    // console.log(items.map((item) => item.name + ' - ' + item.detail))

    // const remaining: { skuMasterId: number; remaining: number }[] =
    //     await prisma.$queryRaw`
    // select "SkuMaster"."id" as "skuMasterId", ("SkuMaster"."remaining" + COALESCE(sum("SkuIn".quantity), 0) - COALESCE(sum("SkuOut".quantity), 0)) as "remaining"
    // from "SkuMaster" left join "SkuIn" on "SkuMaster"."id" = "SkuIn"."skuMasterId"
    // left join "SkuOut" on "SkuMaster"."id" = "SkuOut"."skuMasterId"
    // where "SkuMaster"."id" in (${Prisma.join(items.map((item) => item.skuMasterId))})
    // group by "SkuMaster"."id"
    // `

    // const remaining: { skuMasterId: number; remaining: number }[] =
    //     await prisma.$queryRaw`
    //     select "StockMovement"."skuMasterId", sum("StockMovement"."quantity") from "StockMovement"
    //     where "StockMovement"."skuMasterId" in (${Prisma.join(items.map((item) => item.skuMasterId))})
    //     group by "StockMovement"."skuMasterId"
    //     `

    // const remaining = await prisma.stockMovement.findMany({
    //     where: {
    //         skuMasterId: {
    //             in: items.map((item) => item.skuMasterId),
    //         },
    //     },
    // })

    // const [{ count }] = await prisma.$queryRawUnsafe<{ count: number }[]>(
    //     `select count("GoodsMaster".barcode) from "MainSku"
    // left join "SkuMaster" on "MainSku"."id" = "SkuMaster"."mainSkuId"
    // left join "GoodsMaster" on "SkuMaster"."id" = "GoodsMaster"."skuMasterId"
    // ${query ? `where ` : ` `}
    // ${splitQuery
    //     .map((x, index) =>
    //         x.trim()
    //             ? `(LOWER("MainSku"."name") like $${index + 1} or LOWER("SkuMaster"."detail") like $${index + 1} or
    // LOWER("GoodsMaster"."barcode") like $${index + 1} or LOWER("MainSku"."searchKeyword") like $${index + 1})`
    //             : ``
    //     )
    //     .join(' and ')}
    // `,
    //     ...splitQuery.map((x) => `%${x.toLowerCase()}%`)
    // )
    // const images: { skuMasterId: number; images: string }[] =
    //     await prisma.$queryRaw`select "SkuMaster".id as "skuMasterId", "SkuMasterImage"."path" as "images" from "SkuMaster" left join "SkuMasterImage" on "SkuMaster"."id" = "SkuMasterImage"."skuMasterId" where "SkuMaster"."id" in (${Prisma.join(items.map(({ skuMasterId }) => skuMasterId))})`

    // const mainSkuRemarks = await prisma.$queryRaw<
    //     (MainSkuRemark & { mainSkuId: number })[]
    // >`select "MainSkuRemark".*, "MainSku"."id" as "mainSkuId" from "MainSkuRemark"
    //                         left join "_MainSkuToMainSkuRemark" on "_MainSkuToMainSkuRemark"."B" = "MainSkuRemark"."id"
    //                         left join "MainSku" on "MainSku"."id" = "_MainSkuToMainSkuRemark"."A"
    //                         where "MainSku"."id" in (${Prisma.join(items.map(({ mainSkuId }) => mainSkuId))})`

    // const skuMasterRemarks = await prisma.$queryRaw<
    //     (SkuMasterRemark & { skuMasterId: number })[]
    // >`select "SkuMasterRemark".*, "SkuMaster"."id" as "skuMasterId" from "SkuMasterRemark"
    //                         left join "_SkuMasterToSkuMasterRemark" on "_SkuMasterToSkuMasterRemark"."B" = "SkuMasterRemark"."id"
    //                         left join "SkuMaster" on "SkuMaster"."id" = "_SkuMasterToSkuMasterRemark"."A"
    //                         where "SkuMaster"."id" in (${Prisma.join(items.map(({ skuMasterId }) => skuMasterId))})`

    // console.log(count)
    // return {
    //     items: items.map((item) => ({
    //         ...item,
    //         remaining: remaining
    //             .filter((x) => x.skuMasterId === item.skuMasterId)
    //             .reduce(
    //                 (previousValue, currentValue) =>
    //                     previousValue + currentValue.remaining,
    //                 0
    //             ),
    //         images: images
    //             .filter((x) => x.skuMasterId === item.skuMasterId)
    //             .map((x) => x.images)
    //             .filter((x) => x),
    //         MainSkuRemarks: mainSkuRemarks.filter(
    //             (y) => y.mainSkuId === item.mainSkuId
    //         ),
    //         SkuMasterRemarks: skuMasterRemarks.filter(
    //             (y) => y.skuMasterId === item.skuMasterId
    //         ),
    //     })),
    //     count: Number(count),
    // }
}
