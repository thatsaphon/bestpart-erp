'use server'

import prisma from '@/app/db/db'
import { MainSkuRemark, Prisma, SkuMasterRemark } from '@prisma/client'
import { InventoryDetailType } from '@/types/inventory-detail'

export const searchSku = async (query: string, page: number = 1) => {
    console.log('function searchSku called')
    const splitQuery = query.trim().split(' ')

    const items = await prisma.$queryRawUnsafe<InventoryDetailType[]>(
        `select "MainSku".id as "mainSkuId", "GoodsMaster".id as "goodsMasterId", "GoodsMaster".barcode, "SkuMaster"."id" as "skuMasterId", 
        "MainSku"."name", "SkuMaster"."detail", "GoodsMaster".price, 
    "GoodsMaster".quantity as "quantityPerUnit", "GoodsMaster".unit, "MainSku"."partNumber"
    from "MainSku"
    inner join "SkuMaster" on "MainSku"."id" = "SkuMaster"."mainSkuId"
    inner join "GoodsMaster" on "SkuMaster"."id" = "GoodsMaster"."skuMasterId"
    inner join "_MainSkuToMainSkuRemark" on "MainSku"."id" = "_MainSkuToMainSkuRemark"."A"
    inner join "MainSkuRemark" on "_MainSkuToMainSkuRemark"."B" = "MainSkuRemark"."id"
    inner join "_SkuMasterToSkuMasterRemark" on "SkuMaster"."id" = "_SkuMasterToSkuMasterRemark"."A"
    inner join "SkuMasterRemark" on "_SkuMasterToSkuMasterRemark"."B" = "SkuMasterRemark"."id" 
    ${query ? `where ` : ` `}
    ${splitQuery
        .map((x, index) =>
            x.trim()
                ? `(LOWER("MainSku"."name") like $${index + 1} or LOWER("SkuMaster"."detail") like $${index + 1} or
    LOWER("GoodsMaster"."barcode") like $${index + 1} or LOWER("MainSku"."searchKeyword") like $${index + 1} or
     LOWER("SkuMasterRemark"."name") like $${index + 1} or LOWER("MainSkuRemark"."name") like $${index + 1})`
                : ``
        )
        .join(' and ')}
    limit 10 offset ${(page - 1) * 10}
    `,
        ...splitQuery.map((x) => `%${x.toLowerCase()}%`)
    )
    if (!items.length) throw new Error('ไม่พบสินค้าที่ค้นหา')
    console.log(items.map((item) => item.detail))

    const remaining: { skuMasterId: number; remaining: number }[] =
        await prisma.$queryRaw`select "SkuIn"."skuMasterId", SUM("SkuIn".quantity) - COALESCE(sum("SkuInToOut".quantity), 0)  as remaining 
    from "SkuIn" left join "SkuInToOut" on "SkuIn"."id" = "SkuInToOut"."skuInId" 
    where "SkuIn"."skuMasterId" in (${Prisma.join(items.map((item) => item.skuMasterId))})
    group by "SkuIn"."id"
    having sum("SkuInToOut".quantity) < "SkuIn".quantity or sum("SkuInToOut".quantity) is null`

    const [{ count }] = await prisma.$queryRawUnsafe<{ count: number }[]>(
        `select count("GoodsMaster".barcode) from "MainSku"
    left join "SkuMaster" on "MainSku"."id" = "SkuMaster"."mainSkuId"
    left join "GoodsMaster" on "SkuMaster"."id" = "GoodsMaster"."skuMasterId"
    ${query ? `where ` : ` `}
    ${splitQuery
        .map((x, index) =>
            x.trim()
                ? `(LOWER("MainSku"."name") like $${index + 1} or LOWER("SkuMaster"."detail") like $${index + 1} or
    LOWER("GoodsMaster"."barcode") like $${index + 1} or LOWER("MainSku"."searchKeyword") like $${index + 1})`
                : ``
        )
        .join(' and ')}
    `,
        ...splitQuery.map((x) => `%${x.toLowerCase()}%`)
    )
    const images: { skuMasterId: number; images: string }[] =
        await prisma.$queryRaw`select "SkuMaster".id as "skuMasterId", "SkuMasterImage"."path" as "images" from "SkuMaster" left join "SkuMasterImage" on "SkuMaster"."id" = "SkuMasterImage"."skuMasterId" where "SkuMaster"."id" in (${Prisma.join(items.map(({ skuMasterId }) => skuMasterId))})`

    const mainSkuRemarks = await prisma.$queryRaw<
        (MainSkuRemark & { mainSkuId: number })[]
    >`select "MainSkuRemark".*, "MainSku"."id" as "mainSkuId" from "MainSkuRemark" 
                            left join "_MainSkuToMainSkuRemark" on "_MainSkuToMainSkuRemark"."B" = "MainSkuRemark"."id"
                            left join "MainSku" on "MainSku"."id" = "_MainSkuToMainSkuRemark"."A"
                            where "MainSku"."id" in (${Prisma.join(items.map(({ mainSkuId }) => mainSkuId))})`

    const skuMasterRemarks = await prisma.$queryRaw<
        (SkuMasterRemark & { skuMasterId: number })[]
    >`select "SkuMasterRemark".*, "SkuMaster"."id" as "skuMasterId" from "SkuMasterRemark"
                            left join "_SkuMasterToSkuMasterRemark" on "_SkuMasterToSkuMasterRemark"."B" = "SkuMasterRemark"."id"
                            left join "SkuMaster" on "SkuMaster"."id" = "_SkuMasterToSkuMasterRemark"."A"
                            where "SkuMaster"."id" in (${Prisma.join(items.map(({ skuMasterId }) => skuMasterId))})`

    console.log(count)
    return {
        items: items.map((item) => ({
            ...item,
            remaining: remaining
                .filter((x) => x.skuMasterId === item.skuMasterId)
                .reduce(
                    (previousValue, currentValue) =>
                        previousValue + currentValue.remaining,
                    0
                ),
            images: images
                .filter((x) => x.skuMasterId === item.skuMasterId)
                .map((x) => x.images)
                .filter((x) => x),
            MainSkuRemarks: mainSkuRemarks.filter(
                (y) => y.mainSkuId === item.mainSkuId
            ),
            SkuMasterRemarks: skuMasterRemarks.filter(
                (y) => y.skuMasterId === item.skuMasterId
            ),
        })),
        count: Number(count),
    }
}
