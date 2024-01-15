'use server'

import { prisma } from '@/app/db/db'
import { SkuMaster } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

export async function getInventory() {
}

export async function createInventory(formData: FormData) {
    const code = formData.get('code')
    const name = formData.get('name')
    const tags = formData.getAll('tags') as string[]

    if (typeof code !== 'string') return { message: 'code must not be empty' }
    if (typeof name !== 'string') return { message: 'name must not be empty' }
    const validator = z
        .object({
            code: z.string().trim().min(1, 'code must not be empty'),
            name: z.string().trim().min(1, 'name must not be empty')
        })

    const result = validator.safeParse({ code, name })
    if (!result.success) return {
        message: fromZodError(result.error,
            { prefix: '', prefixSeparator: '', includePath: false, issueSeparator: '\n' }).message
    }

    try {

        const sku = await prisma.skuMaster.create({
            data: {
                code,
                name,
                flag: { tags },

            }
        })
        console.log('revalidate')
        revalidatePath('/(root)/inventory', 'page')
        return {
            message: 'success',
            data: sku
        }
    } catch (error) {
        return {
            message: 'error'
        }
    }
}

export const deleteInventory = async (formData: FormData) => {
    const code = formData.get('code') as string
    console.log(code)
    await prisma.skuMaster.delete({ where: { code } })
    revalidatePath('/(root)/inventory', 'page')
}