'use server'

import prisma from '@/app/db/db'
import { InventoryDetailType } from '@/types/inventory-detail'
import { Prisma } from '@prisma/client'

export const searchDistinctMainSku = async (query: string, page: number = 1) => {
    const splitQuery = query.trim().split(' ')

    const items = await prisma.$queryRawUnsafe<
        InventoryDetailType[]
    >(
        `select distinct "MainSku"."name", "MainSku"."partNumber"
    from "MainSku"
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
    limit 10 offset ${(page - 1) * 10}
    `,
        ...splitQuery.map((x) => `%${x.toLowerCase()}%`)
    )
    console.log(items)
    console.log(items.length)
    if (!items.length) throw new Error('ไม่พบสินค้าที่ค้นหา')

    const extendedItems: InventoryDetailType[] = await prisma.$queryRaw`select "MainSku".id, "GoodsMaster".id as "goodsMasterId", "GoodsMaster".barcode, "SkuMaster"."id" as "skuMasterId", "MainSku"."name", "SkuMaster"."detail", "SkuMaster"."remark", "GoodsMaster".price, 
    "GoodsMaster".quantity as "quantityPerUnit", "GoodsMaster".unit, "MainSku"."partNumber"
    from "MainSku"
    left join "SkuMaster" on "MainSku"."id" = "SkuMaster"."mainSkuId"
    left join "GoodsMaster" on "SkuMaster"."id" = "GoodsMaster"."skuMasterId"
    where "MainSku"."name" in (${Prisma.join(items.map((item) => item.name))})`


    const remaining: { skuMasterId: number; remaining: number }[] =
        await prisma.$queryRaw`select "SkuIn"."skuMasterId", SUM("SkuIn".quantity) - COALESCE(sum("SkuInToOut".quantity), 0)  as remaining 
    from "SkuIn" left join "SkuInToOut" on "SkuIn"."id" = "SkuInToOut"."skuInId" 
    where "SkuIn"."skuMasterId" in (${Prisma.join(extendedItems.map((item) => item.skuMasterId))})
    group by "SkuIn"."id"
    having sum("SkuInToOut".quantity) < "SkuIn".quantity or sum("SkuInToOut".quantity) is null`

    const images: { skuMasterId: number, images: string }[] = await prisma.$queryRaw`select "SkuMaster".id as "skuMasterId", "Image"."path" as "images" from "SkuMaster" left join "Image" on "SkuMaster"."id" = "Image"."skuMasterId" where "SkuMaster"."id" in (${Prisma.join(extendedItems.map((item) => item.skuMasterId))})`

    const [{ count }] = await prisma.$queryRawUnsafe<{ count: number }[]>(
        `select count(distinct "MainSku".name) from "MainSku"
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
    limit 10 offset ${(1 - 1) * 10}
    `,
        ...splitQuery.map((x) => `%${x.toLowerCase()}%`)
    )

    const returnItems = items.map((item) => [...extendedItems.filter((x) => x.name === item.name).map((item) => ({
        ...item,
        remaining: remaining
            .filter((x) => x.skuMasterId === item.skuMasterId)
            .reduce(
                (previousValue, currentValue) =>
                    previousValue + currentValue.remaining,
                0
            ),
        images: images.filter((x) => x.skuMasterId === item.skuMasterId).map((x) => x.images)
    }))])

    return {
        items: returnItems,
        count: Number(count),
    }
}
