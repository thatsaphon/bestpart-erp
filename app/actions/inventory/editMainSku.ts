'use server'

import prisma from '@/app/db/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

export const editMainSku = async (formData: FormData) => {
    const validator = z.object({
        name: z.string().trim(),
        partNumber: z.string().optional(),
        id: z.number().positive().int(),
    })
    // const name = formData.get('name')
    // const partNumber = formData.get('partNumber')
    // const id = Number(formData.get('id'))
    const result = validator.safeParse({
        name: formData.get('name'),
        partNumber: formData.get('partNumber'),
        id: Number(formData.get('id')),
    })
    if (!result.success) return { error: fromZodError(result.error).message }
    const { name, partNumber, id } = result.data
    await prisma.mainSku.update({
        where: {
            id,
        },
        data: {
            name,
            partNumber,
        },
    })
    revalidatePath('/inventory')
    return { error: '' }
}
