'use server'

import prisma from '@/app/db/db'
import { InventoryDetailType } from '@/types/inventory-detail'

export const getSkuByBarcode = async (barcode: string) => {
    const [result]: InventoryDetailType[] = await prisma.$queryRaw`
            select "MainSku".id as "mainSkuId", "GoodsMaster".id as "goodsMasterId", "GoodsMaster".barcode, "SkuMaster"."id" as "skuMasterId", "MainSku"."name", "SkuMaster"."detail", "GoodsMaster".price,
            "GoodsMaster".quantity as "quantityPerUnit", "GoodsMaster".unit, "MainSku"."partNumber" from "MainSku"
            left join "SkuMaster" on "MainSku"."id" = "SkuMaster"."mainSkuId"
            left join "GoodsMaster" on "SkuMaster"."id" = "GoodsMaster"."skuMasterId"
            where "GoodsMaster".barcode = ${barcode}`

    if (!result) throw new Error('Barcode not found')

    const remaining: { skuMasterId: number; remaining: number }[] =
        await prisma.$queryRaw`select "SkuIn"."skuMasterId", SUM("SkuIn".quantity) - COALESCE(sum("SkuInToOut".quantity), 0)  as remaining 
    from "SkuIn" left join "SkuInToOut" on "SkuIn"."id" = "SkuInToOut"."skuInId" 
    where "SkuIn"."skuMasterId" = ${result.skuMasterId}
    group by "SkuIn"."id"
    having sum("SkuInToOut".quantity) < "SkuIn".quantity or sum("SkuInToOut".quantity) is null`


    return { ...result, remaining: remaining[0].remaining }

}


