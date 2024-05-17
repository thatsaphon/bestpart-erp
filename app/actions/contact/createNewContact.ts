'use server'

import prisma from '@/app/db/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const createNewContact = async (formData: FormData) => {
    const validator = z.object({
        name: z.string().trim().min(1, 'name must not be empty'),
        fullName: z.string().trim().optional().nullable(),
        isAr: z.boolean().default(true),
        isAp: z.boolean().default(false),
        phone: z.string().trim().min(1, 'phone must not be empty'),
        address: z.string().trim(),
        taxId: z.string().trim().optional(),
        searchKeyword: z.string().trim().optional(),
    })

    const { name, fullName, isAr, isAp, phone, address, taxId, searchKeyword } =
        await validator.parse({
            name: formData.get('name'),
            isAr: formData.get('isAr') || undefined,
            isAp: formData.get('isAp') || undefined,
            phone: formData.get('phone'),
            address: formData.get('address'),
            taxId: formData.get('taxId') || undefined,
            searchKeyword: formData.get('searchKeyword') || undefined,
        })

    await prisma.contact.create({
        data: {
            name,
            isAr,
            isAp,
            searchKeyword,
            Address: {
                create: {
                    isMain: true,
                    name: fullName || name,
                    phone,
                    addressLine1: address.split('\n')[0] || undefined,
                    addressLine2: address.split('\n')[1] || undefined,
                    addressLine3: address.split('\n')[2] || undefined,
                    taxId,
                },
            },
        },
    })

    revalidatePath('/contact')
}
