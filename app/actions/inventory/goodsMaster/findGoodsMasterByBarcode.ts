'use server'

import prisma from '@/app/db/db'

export const findGoodsMasterByBarcode = async (barcode: string) => {
    try {
        if (!barcode.trim()) throw new Error('Barcode must not be empty')

        const data = await prisma.mainSku.findFirst({
            include: {
                skuMasters: {
                    where: {
                        goodsMasters: {
                            some: { barcode: { equals: barcode } },
                        },
                    },
                    include: {
                        goodsMasters: {
                            where: { barcode: { equals: barcode } },
                        },
                        brand: true,
                        images: true,
                        skuMovements: true,
                    },
                },
            },
        })
        console.log(data)
        if (!data) throw new Error('Data not found')
        if (!data?.skuMasters[0]?.goodsMasters[0])
            throw new Error('Data not found')

        return data
    } catch (err) {
        if (err instanceof Error) throw err
        throw new Error('Something went wrong')
    }
}
