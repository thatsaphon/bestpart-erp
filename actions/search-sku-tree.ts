'use server'

import prisma from '@/app/db/db'
import { MainSkuRemark, Prisma, SkuMasterRemark } from '@prisma/client'
import { DocumentItem } from '@/types/document-item'

export const searchSkuTree = async (
    where: Prisma.MainSkuWhereInput,
    page: number = 1,
    orderBy: Prisma.MainSkuOrderByWithRelationInput = { name: 'asc' }
) => {
    const items = await prisma.mainSku.findMany({
        where,
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
        where,
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
            MainSkuRemark: mainSku.MainSkuRemark,
            SkuMaster: mainSku.SkuMaster.map((sku) => ({
                skuMasterId: sku.id,
                detail: sku.detail,
                SkuMasterRemark: sku.SkuMasterRemark,
                Image: sku.Image,
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
