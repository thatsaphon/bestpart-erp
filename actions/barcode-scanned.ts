'use server'

import prisma from '@/app/db/db'
import { InventoryDetailType } from '@/types/inventory-detail'
import { MainSkuRemark, SkuMasterRemark } from '@prisma/client'

export const getSkuByBarcode = async (barcode: string) => {
    // const lastConfirmingInventory = await prisma.confirmStockDate.findMany({

    // })
    const result = await prisma.goodsMaster.findUnique({
        where: {
            barcode: barcode,
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
    })
    if (!result) throw new Error('Barcode not found')
    const remaining = await prisma.stockMovement.aggregate({
        where: {
            skuMasterId: result.skuMasterId,
        },
        _sum: {
            quantity: true,
        },
    })
    return {
        mainSkuId: result.SkuMaster.mainSkuId,
        goodsMasterId: result.id,
        barcode: result.barcode,
        skuMasterId: result.skuMasterId,
        name: result.SkuMaster.MainSku.name,
        detail: result.SkuMaster.detail,
        unit: result.unit,
        quantityPerUnit: result.quantityPerUnit,
        quantity: 0,
        pricePerUnit: result.quantityPerUnit,
        partNumber: result.SkuMaster.MainSku.partNumber || '',
        remaining: remaining._sum.quantity || 0,
        images: result.SkuMaster.Image,
        MainSkuRemarks: result.SkuMaster.MainSku.MainSkuRemark,
        SkuMasterRemarks: result.SkuMaster.SkuMasterRemark,
    }
}
