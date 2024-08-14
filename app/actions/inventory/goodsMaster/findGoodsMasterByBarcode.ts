'use server'

import prisma from '@/app/db/db'

export const findGoodsMasterByBarcode = async (barcode: string) => {
    try {
        if (!barcode.trim()) throw new Error('Barcode must not be empty')

        const data = await prisma.mainSku.findFirst({
            where: {
                SkuMaster: {
                    some: {
                        GoodsMaster: {
                            some: {
                                barcode,
                            },
                        },
                    },
                },
            },
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
                        Image: true,

                        SkuIn: true,
                        SkuOut: true,
                    },
                },
            },
        })
        if (!data) throw new Error('Data not found')
        if (!data?.SkuMaster[0]?.GoodsMaster[0])
            throw new Error('Data not found')

        return data
    } catch (err) {
        if (err instanceof Error) throw err
        throw new Error('Something went wrong')
    }
}
