'use server'

import prisma from '@/app/db/db'

export const findGoodsMasterByBarcode = async (barcode: string) => {
    try {
        if (!barcode.trim()) throw new Error('Barcode must not be empty')

        const data = await prisma.mainSku.findFirst({
            include: {
                SkuMaster: {
                    where: {
                        GoodsMaster: {
                            some: { barcode: { equals: barcode } },
                        },
                    },
                    include: {
                        GoodsMaster: {
                            where: { barcode: { equals: barcode } },
                        },
                        Brand: true,
                        Image: true,
                        SkuIn: {
                            where: { remaining: { not: 0 } },
                        },
                    },
                },
            },
        })
        console.log(data)
        if (!data) throw new Error('Data not found')
        if (!data?.SkuMaster[0]?.GoodsMaster[0])
            throw new Error('Data not found')

        return data
    } catch (err) {
        if (err instanceof Error) throw err
        throw new Error('Something went wrong')
    }
}
