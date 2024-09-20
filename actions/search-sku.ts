'use server'

import prisma from '@/app/db/db'
import { MainSkuRemark, Prisma, SkuMasterRemark } from '@prisma/client'
import { DocumentItem } from '@/types/document-item'
import { checkRemaining } from './check-remaining'

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
                                        remark: {
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
                                            remark: {
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
                                        remark: {
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
                                            remark: {
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

    const remaining = await checkRemaining(
        items.map((item) => item.skuMasterId)
    )

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
            pricePerUnit: goods.pricePerUnit,
            partNumber: goods.SkuMaster.MainSku.partNumber || '',
            remaining:
                remaining.find((r) => r.skuMasterId === goods.skuMasterId)
                    ?.remaining || 0,
            Image: goods.SkuMaster.Image,
            MainSkuRemark: goods.SkuMaster.MainSku.MainSkuRemark,
            SkuMasterRemark: goods.SkuMaster.SkuMasterRemark,
        })),
        count,
    }
}
