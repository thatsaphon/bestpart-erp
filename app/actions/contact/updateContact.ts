'use server'

import prisma from '@/app/db/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const updateContact = async (id: number, formData: FormData) => {
    const validator = z.object({
        name: z.string().trim(),
        address: z.string().trim().optional(),
        phone: z.string().trim().optional(),
        taxId: z.string().trim().optional(),
        isAr: z.coerce.boolean().default(true),
        isAp: z.coerce.boolean().default(false),
        credit: z.coerce.boolean().default(false),
        searchKeyword: z.string().trim().optional(),
    })

    const { name, address, phone, taxId, isAr, isAp, credit, searchKeyword } = validator.parse({
        name: formData.get('name'),
        address: formData.get('address') || undefined,
        phone: formData.get('phone') || undefined,
        taxId: formData.get('taxId') || undefined,
        isAr: formData.get('isAr')?.toString().toLowerCase() === 'true',
        isAp: formData.get('isAp')?.toString().toLowerCase() === 'true',
        credit: formData.get('credit')?.toString().toLowerCase() === 'true',
        searchKeyword: formData.get('searchKeyword') || undefined,
    })

    await prisma.contact.update({
        where: {
            id,
        },
        data: {
            name,
            address,
            phone,
            taxId,
            isAr,
            isAp,
            credit,
            searchKeyword,
        },
    })

    revalidatePath(`/contact/${id}`)
}
