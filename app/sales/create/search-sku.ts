'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'
import { InventoryDetailType } from '@/types/inventory-detail'

export const searchSku = async (query: string, page: number = 1) => {
    const splitQuery = query.trim().split(' ')

    const items = await prisma.$queryRawUnsafe<
        InventoryDetailType[]
    >(
        `select "MainSku".id, "GoodsMaster".id as "goodsMasterId", "GoodsMaster".barcode, "SkuMaster"."id" as "skuMasterId", "MainSku"."name", "SkuMaster"."detail", "SkuMaster"."remark", "GoodsMaster".price, 
    "GoodsMaster".quantity as "quantityPerUnit", "GoodsMaster".unit, "MainSku"."partNumber"
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
    if (!items.length) throw new Error('ไม่พบสินค้าที่ค้นหา')

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
    limit 10 offset ${(page - 1) * 10}
    `,
        ...splitQuery.map((x) => `%${x.toLowerCase()}%`)
    )
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
        })),
        count: Number(count),
    }
}
