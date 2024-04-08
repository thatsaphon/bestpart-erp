'use server'

import prisma from '@/app/db/db'
import { ZodError, z } from 'zod'

export async function createMainSku(formData: FormData) {
    const schema = z.object({
        name: z.string(),
        partNumber: z.string().optional(),
    })
    const result = schema.parse({
        name: formData.get('name'),
        partNumber: formData.get('partNumber'),
    })
    await prisma.mainSku.create({
        data: {
            name: result.name,
            partNumber: result.partNumber,
        },
    })
}
