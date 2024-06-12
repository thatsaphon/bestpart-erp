'use server'

import prisma from '@/app/db/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

export async function getInventory(page = '1', limit = '10') {
    return await prisma.skuMaster.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
            remark: true,
        },
    })
}

export async function getPartNumbers(page = '1', limit = '10') {
    return await prisma.mainSku.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
            SkuMaster: true,
        },
    })
}

export async function createInventory(formData: FormData) {
    const validator = z.object({
        detail: z.string().trim(),
        remark: z.array(z.string().trim().optional()),
        mainSkuId: z.number().positive().int(),
        tags: z
            .array(z.string().trim().min(1, 'tag must not be empty'))
            .optional(),
    })

    const result = validator.safeParse({
        detail: formData.get('detail'),
        remark: formData.getAll('remark'),
        mainSkuId: Number(formData.get('mainSkuId')),
    })
    if (!result.success)
        return {
            message: fromZodError(result.error, {
                prefix: '',
                prefixSeparator: '',
                includePath: false,
                issueSeparator: '\n',
            }).message,
        }

    try {
        const sku = await prisma.skuMaster.create({
            data: {
                detail: result.data.detail,
                // remark: result.data.remark,
                remark: {
                    connectOrCreate: result.data.remark.filter((remark) => remark).map((remark) => ({ create: { name: remark as string }, where: { name: remark as string } })),
                    // connectOrCreate: [{ create: { name: '' }, where: { name: '' } }]
                },
                mainSkuId: result.data.mainSkuId,
            },
        })
        revalidatePath('/inventory')
        return {
            message: 'success',
            data: sku,
        }
    } catch (error) {
        console.log(error)
        return {
            message: 'error',
        }
    }
}

export const deleteInventory = async (formData: FormData) => {
    const id = Number(formData.get('id'))
    await prisma.skuMaster.delete({ where: { id } })
    revalidatePath('/inventory')
}

export const editInventory = async (formData: FormData) => {
    const validator = z.object({
        id: z.number().positive().int(),
        detail: z.string().trim().optional(),
        remark: z.array(z.string().trim().optional()),
        tags: z.array(z.string().trim().min(1, 'tag must not be empty')),
    })
    try {
        const { id, detail, remark, tags } = validator.parse({
            id: formData.get('id'),
            detail: formData.get('detail'),
            remark: formData.getAll('remark'),
            tags: formData.getAll('tags'),
        })
        await prisma.skuMaster.update({
            where: {
                id,
            },
            data: {
                detail,
            },
        })
    } catch (error) {
        return error
    }
}
