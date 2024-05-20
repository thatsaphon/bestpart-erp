'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const searchSku = async (query: string) => {
    const splitQuery = query.trim().split(' ')

    const result = await prisma.$queryRawUnsafe<{
        barcode: string
        name: string
        detail: string
        price: number
        quantity: number
        unit: string
        partNumber: string
    }>(
        `select "GoodsMaster".barcode, "MainSku"."name", "SkuMaster"."detail", "GoodsMaster".price, 
        "GoodsMaster".quantity, "GoodsMaster".unit, "MainSku"."partNumber" from "MainSku"
    left join "SkuMaster" on "MainSku"."id" = "SkuMaster"."mainSkuId"
    left join "GoodsMaster" on "SkuMaster"."id" = "GoodsMaster"."skuMasterId"
    ${query ? `where ` : ``}
    ${splitQuery
        .map(
            (
                x,
                index
            ) => `("MainSku"."name" like $${index + 1} or "SkuMaster"."detail" like $${index + 1} or
    "GoodsMaster"."barcode" like $${index + 1} or "MainSku"."searchKeyword" like $${index + 1})`
        )
        .join(' and ')}
    `,
        ...splitQuery.map((x) => `%${x}%`)
    )

    console.log(result)
}
