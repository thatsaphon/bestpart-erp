'use server'

import prisma from '@/app/db/db'
import { MainSkuRemark, Prisma, SkuMasterRemark } from '@prisma/client'
import { DocumentItem } from '@/types/document-item'

export const searchSkuTree = async (
    query: string,
    page: number = 1,
    orderBy: Prisma.MainSkuOrderByWithRelationInput = { name: 'asc' }
) => {
    const splitQuery = query.trim().split(' ')

    const items = await prisma.mainSku.findMany({
        where: {
            AND: [
                ...splitQuery
                    .filter((q) => q)
                    .map((q) => ({
                        OR: [
                            {
                                SkuMaster: {
                                    some: {
                                        GoodsMaster: {
                                            some: {
                                                barcode: {
                                                    contains: q,
                                                    mode: 'insensitive',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                SkuMaster: {
                                    some: {
                                        detail: {
                                            contains: q,
                                            mode: 'insensitive',
                                        },
                                    },
                                },
                            },
                            {
                                SkuMaster: {
                                    some: {
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
                            },
                            {
                                name: {
                                    contains: q,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                partNumber: {
                                    contains: q,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                MainSkuRemark: {
                                    some: {
                                        name: {
                                            contains: q,
                                            mode: 'insensitive',
                                        },
                                    },
                                },
                            },
                        ] as Prisma.MainSkuWhereInput[],
                    })),
            ],
        },
        include: {
            SkuMaster: {
                include: {
                    GoodsMaster: true,
                    Image: true,
                    SkuMasterRemark: true,
                },
            },
            MainSkuRemark: true,
        },
        skip: (page - 1) * 10,
        take: 10,
        orderBy: { name: 'asc' },
    })
    const count = await prisma.mainSku.count({
        where: {
            AND: [
                ...splitQuery
                    .filter((q) => q)
                    .map((q) => ({
                        OR: [
                            {
                                SkuMaster: {
                                    some: {
                                        GoodsMaster: {
                                            some: {
                                                barcode: {
                                                    contains: q,
                                                    mode: 'insensitive',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                SkuMaster: {
                                    some: {
                                        detail: {
                                            contains: q,
                                            mode: 'insensitive',
                                        },
                                    },
                                },
                            },
                            {
                                SkuMaster: {
                                    some: {
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
                            },
                            {
                                name: {
                                    contains: q,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                partNumber: {
                                    contains: q,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                MainSkuRemark: {
                                    some: {
                                        name: {
                                            contains: q,
                                            mode: 'insensitive',
                                        },
                                    },
                                },
                            },
                        ] as Prisma.MainSkuWhereInput[],
                    })),
            ],
        },
    })

    const remaining = await prisma.stockMovement.groupBy({
        by: ['skuMasterId'],
        where: {
            skuMasterId: {
                in: items.flatMap((item) => item.SkuMaster).map((i) => i.id),
            },
        },
        _sum: {
            quantity: true,
        },
    })
    return {
        items: items.map((mainSku) => ({
            mainSkuId: mainSku.id,
            partNumber: mainSku.partNumber || '',
            name: mainSku.name,
            SkuMaster: mainSku.SkuMaster.map((sku) => ({
                skuMasterId: sku.id,
                detail: sku.detail,
                GoodsMaster: sku.GoodsMaster.map((goods) => ({
                    mainSkuId: mainSku.id,
                    goodsMasterId: goods.id,
                    barcode: goods.barcode,
                    skuMasterId: goods.skuMasterId,
                    name: mainSku.name,
                    detail: sku.detail,
                    unit: goods.unit,
                    quantityPerUnit: goods.quantityPerUnit,
                    quantity: 0,
                    pricePerUnit: goods.pricePerUnit,
                    partNumber: mainSku.partNumber || '',
                    remaining:
                        remaining.find(
                            (r) => r.skuMasterId === goods.skuMasterId
                        )?._sum.quantity || 0,
                    Image: sku.Image,
                    MainSkuRemark: mainSku.MainSkuRemark,
                    SkuMasterRemark: sku.SkuMasterRemark,
                })) as DocumentItem[],
            })),
        })),
        count,
    }
}
