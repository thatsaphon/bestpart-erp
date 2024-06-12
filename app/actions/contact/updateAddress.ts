'use server'

import prisma from '@/app/db/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export default async function updateAddress(
    id: number,
    formData: FormData
) {
    const validator = z.object({
        name: z.string().trim().optional(),
        address: z.string().trim().optional(),
        phone: z.string().trim().optional(),
        taxId: z.string().trim().optional(),
        isMain: z
            .string()
            .nullable()
            .transform((value) => value === 'on' || value === 'true'),
    })

    const { name, address, phone, taxId, isMain } = validator.parse({
        name: formData.get('name') || undefined,
        address: formData.get('address') || undefined,
        phone: formData.get('phone') || undefined,
        taxId: formData.get('taxId') || undefined,
        isMain: formData.get('isMain'),
    })

    await prisma.contact.update({
        where: {
            id
        },
        data: {
            address,
            phone,
            taxId,

        },
    })

    revalidatePath(`/contact/${id}`)
}
