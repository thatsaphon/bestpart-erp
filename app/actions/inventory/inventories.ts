'use server'

import prisma from '@/app/db/db'
import { SkuMaster } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

export async function getInventory(page = '1', limit = '10') {
    return await prisma.skuMaster.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
            brand: true,
            carModel: true,
        },
    })
}

export async function getPartNumbers(page = '1', limit = '10') {
    return await prisma.mainSku.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
            skuMasters: true,
        },
    })
}

export async function createInventory(formData: FormData) {
    const code = formData.get('code')
    const name = formData.get('name')
    const tags = formData.getAll('tags') as string[]

    if (typeof code !== 'string') return { message: 'code must not be empty' }
    if (typeof name !== 'string') return { message: 'name must not be empty' }
    const validator = z.object({
        code: z.string().trim().min(1, 'code must not be empty'),
        name: z.string().trim().min(1, 'name must not be empty'),
    })

    const result = validator.safeParse({ code, name })
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
                code,
                name,
                flag: { tags },
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
    const code = formData.get('code') as string
    await prisma.skuMaster.delete({ where: { code } })
    revalidatePath('/inventory')
}

export const editInventory = async (formData: FormData) => {
    // const code = formData.get('code')
    // const name = formData.get('name')
    // const tags = formData.getAll('tags') as string[]
    const validator = z.object({
        code: z.string().trim().min(1, 'code must not be empty'),
        name: z.string().trim().min(1, 'name must not be empty'),
        tags: z.array(z.string().trim().min(1, 'tag must not be empty')),
    })
    try {
        const { code, name, tags } = validator.parse({
            code: formData.get('code'),
            name: formData.get('name'),
            tags: formData.getAll('tags'),
        })
        await prisma.skuMaster.update({
            where: {
                code,
            },
            data: {
                name,
                flag: {
                    set: tags,
                },
            },
        })
    } catch (error) {
        return error
    }
}

const uploadPicture = async (formData: FormData) => {
    const validator = z.object({
        code: z.string().trim().min(1, 'code must not be empty'),
    })
}
