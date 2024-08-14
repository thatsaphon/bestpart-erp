'use server'

import prisma from '@/app/db/db'
import { InventoryDetailType } from '@/types/inventory-detail'
import { MainSkuRemark, SkuMasterRemark } from '@prisma/client'

export const getSkuByBarcode = async (barcode: string) => {
    // const lastConfirmingInventory = await prisma.confirmStockDate.findMany({

    // })
    const [result]: InventoryDetailType[] = await prisma.$queryRaw`
            select "MainSku".id as "mainSkuId", "GoodsMaster".id as "goodsMasterId", "GoodsMaster".barcode, 
            "SkuMaster"."id" as "skuMasterId", "MainSku"."name", "SkuMaster"."detail", "SkuMaster".remaining, "SkuMaster"."remainingAt",
             "GoodsMaster".price, "GoodsMaster".quantity as "quantityPerUnit", "GoodsMaster".unit, "MainSku"."partNumber" from "MainSku"
            left join "SkuMaster" on "MainSku"."id" = "SkuMaster"."mainSkuId"
            left join "GoodsMaster" on "SkuMaster"."id" = "GoodsMaster"."skuMasterId"
            where "GoodsMaster".barcode = ${barcode}`

    if (!result) throw new Error('Barcode not found')

    const skuIn = await prisma.skuIn.aggregate({
        where: {
            skuMasterId: result.skuMasterId,
            date: {
                gte: result.remainingAt,
            },
        },
        _sum: {
            quantity: true,
        },
    })

    const skuOut = await prisma.skuOut.aggregate({
        where: {
            skuMasterId: result.skuMasterId,
            date: {
                gte: result.remainingAt,
            },
        },
        _sum: {
            quantity: true,
        },
    })

    const images: { skuMasterId: number; images: string }[] =
        await prisma.$queryRaw`select "SkuMaster".id as "skuMasterId", "SkuMasterImage"."path" as "images" from "SkuMaster" left join "SkuMasterImage" on "SkuMaster"."id" = "SkuMasterImage"."skuMasterId" where "SkuMaster"."id" in (${result.skuMasterId})`

    const mainSkuRemarks = await prisma.$queryRaw<
        (MainSkuRemark & { mainSkuId: number })[]
    >`select "MainSkuRemark".*, "MainSku"."id" as "mainSkuId" from "MainSkuRemark" 
                            left join "_MainSkuToMainSkuRemark" on "_MainSkuToMainSkuRemark"."B" = "MainSkuRemark"."id"
                            left join "MainSku" on "MainSku"."id" = "_MainSkuToMainSkuRemark"."A"
                            where "MainSku"."id" in (${result.mainSkuId})`

    const skuMasterRemarks = await prisma.$queryRaw<
        (SkuMasterRemark & { skuMasterId: number })[]
    >`select "SkuMasterRemark".*, "SkuMaster"."id" as "skuMasterId" from "SkuMasterRemark"
                            left join "_SkuMasterToSkuMasterRemark" on "_SkuMasterToSkuMasterRemark"."B" = "SkuMasterRemark"."id"
                            left join "SkuMaster" on "SkuMaster"."id" = "_SkuMasterToSkuMasterRemark"."A"
                            where "SkuMaster"."id" in (${result.skuMasterId})`

    return {
        ...result,
        remaining:
            result.remaining ||
            0 + (skuIn?._sum?.quantity ?? 0) - (skuOut?._sum?.quantity ?? 0),
        images: images.map(({ images }) => images),
        mainSkuRemarks,
        skuMasterRemarks,
    }
}
