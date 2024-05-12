'use server'

import prisma from '@/app/db/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const updateContact = async (id: number, formData: FormData) => {
    const validator = z.object({
        name: z.string().trim(),
        isAr: z.coerce.boolean().default(true),
        isAp: z.coerce.boolean().default(false),
        credit: z.coerce.boolean().default(false),
        searchKeyword: z.string().trim().optional(),
    })

    const { name, isAr, isAp, credit, searchKeyword } = validator.parse({
        name: formData.get('name'),
        isAr: formData.get('isAr')?.toString().toLowerCase() === 'true',
        isAp: formData.get('isAp')?.toString().toLowerCase() === 'true',
        credit: formData.get('credit')?.toString().toLowerCase() === 'true',
        searchKeyword: formData.get('searchKeyword') || undefined,
    })
    console.log(formData.get('isAr'))
    console.log(formData.get('isAp'))

    await prisma.contact.update({
        where: {
            id,
        },
        data: {
            name,
            isAr,
            isAp,
            credit,
            searchKeyword,
        },
    })

    revalidatePath(`/contact/${id}`)
}
