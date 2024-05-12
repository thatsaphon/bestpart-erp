'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

export const createOrUpdateGoodsMasters = async (
    prevState: { error: string },
    formData: FormData
) => {
    const validator = z.object({
        detail: z.string().trim(),
        remark: z.string().trim().optional().nullable(),
        skuMasterId: z.number().positive().int(),
        goodsMasterId: z.array(
            z.coerce.number().positive().int().or(z.string())
        ),
        barcode: z.array(z.string().trim().min(1, 'barcode must not be empty')),
        unit: z.array(z.string().trim().min(1, 'unit must not be empty')),
        quantity: z.array(z.coerce.number().positive()),
        price: z.array(z.coerce.number().positive()),
    })

    const validateResult = validator.safeParse({
        detail: formData.get('detail'),
        remark: formData.get('remark'),
        skuMasterId: Number(formData.get('skuMasterId')),
        goodsMasterId: formData.getAll('goodsMasterId'),
        barcode: formData.getAll('barcode'),
        unit: formData.getAll('unit'),
        quantity: formData.getAll('quantity'),
        price: formData.getAll('price'),
    })

    if (!validateResult.success) {
        console.log(validateResult.error)
        return { error: fromZodError(validateResult.error).message }
    }
    const {
        detail,
        remark,
        skuMasterId,
        goodsMasterId,
        barcode,
        unit,
        quantity,
        price,
    } = validateResult.data
    const goodsMasters = goodsMasterId.map((id, index) => ({
        id,
        barcode: barcode[index],
        unit: unit[index],
        quantity: quantity[index],
        price: price[index],
    }))

    try {
        await prisma.skuMaster.update({
            where: { id: skuMasterId },
            data: {
                detail,
                remark,
                GoodsMaster: {
                    deleteMany: {
                        skuMasterId: skuMasterId,
                        NOT: goodsMasterId
                            .filter((id) => !!id)
                            .map((id) => ({ id: id })) as { id: number }[],
                    },
                    createMany: {
                        data: goodsMasters
                            .filter(({ id }) => !id)
                            .map((goodsMaster) => ({
                                ...goodsMaster,
                                id: undefined,
                            })),
                    },
                    updateMany: goodsMasters
                        .filter(({ id }) => !!id)
                        .map((goodsMaster) => ({
                            data: {
                                ...goodsMaster,
                                id: undefined,
                            },
                            where: { id: +goodsMaster.id },
                        })),
                },
            },
        })
        revalidatePath('/inventory')
        return { error: '' }
    } catch (err) {
        if (err instanceof Error) {
            return { error: err.message }
        }
        return { error: JSON.stringify(err) }
    }
}
