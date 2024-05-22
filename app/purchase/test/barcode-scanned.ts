'use server'

import prisma from '@/app/db/db'

export const getSkuByBarcode = async (barcode: string) => {
    const [result]: {
        barcode: string
        skuMasterId: number
        name: string
        detail: string
        price: number
        quantityPerUnit: number
        unit: string
        partNumber: string
    }[] = await prisma.$queryRaw`
            select "GoodsMaster".barcode, "SkuMaster"."id", "MainSku"."name", "SkuMaster"."detail", "GoodsMaster".price,
            "GoodsMaster".quantity as "quantityPerUnit", "GoodsMaster".unit, "MainSku"."partNumber" from "MainSku"
            left join "SkuMaster" on "MainSku"."id" = "SkuMaster"."mainSkuId"
            left join "GoodsMaster" on "SkuMaster"."id" = "GoodsMaster"."skuMasterId"
            where "GoodsMaster".barcode = ${barcode}`

    if (!result) throw new Error('Barcode not found')
    return { ...result }

}


