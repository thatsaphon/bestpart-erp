'use server'
import fs from 'node:fs/promises'
import { revalidatePath } from 'next/cache'
import { csvToJSONObject } from '@/lib/csvToObject'
import * as CSV from 'csv-string'
import prisma from '../db/db'
import { create } from 'node:domain'
import { generateBarcode } from '../actions/inventory/generateBarcode'

export async function uploadFile(formData: FormData) {
    const file = formData.get('file') as File
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const text = new TextDecoder().decode(buffer)

    const parsed = CSV.parse(text)

    const createObjects = parsed.map(async (item) => {
        return {
            name: item[0],
            SkuMaster: {
                create: {
                    detail: '',
                    GoodsMaster: {
                        create: {
                            barcode: await generateBarcode(),
                            price: +item[1],
                            quantity: 1,
                            unit: 'ตัว',
                        },
                    },
                },
            },
        }
    })

    const objects = (await Promise.all(createObjects)).slice(1)

    await prisma.mainSku.createMany({
        data: objects.map((x) => {
            return { name: x.name }
        }),
        skipDuplicates: true,
    })

    const mainSkus = await prisma.mainSku.findMany({
        where: {
            name: {
                in: objects.map((x) => x.name),
            },
        },
    })

    await prisma.skuMaster.createMany({
        data: mainSkus.map((x) => {
            return {
                mainSkuId: x.id,
                detail: '',
            }
        }),
        skipDuplicates: true,
    })

    const skuMasters = await prisma.skuMaster.findMany({
        where: {
            mainSkuId: {
                in: mainSkus.map((x) => x.id),
            },
        },
        include: {
            mainSku: true,
        },
    })

    await prisma.goodsMaster.createMany({
        data: skuMasters.map((x) => {
            return {
                skuMasterId: x.id,
                barcode:
                    objects.filter((y) => y.name === x.mainSku.name)[0]
                        .SkuMaster.create.GoodsMaster.create.barcode || '',
                price: objects.filter((y) => y.name === x.mainSku.name)[0]
                    .SkuMaster.create.GoodsMaster.create.price,
                quantity: 1,
                unit: 'ตัว',
            }
        }),
        skipDuplicates: true,
    })

    await revalidatePath('/inventory')
}
