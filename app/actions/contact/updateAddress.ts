'use server'

import prisma from '@/app/db/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export default async function updateAddress(
    id: number,
    addressId: number | undefined,
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
    console.log(formData.get('isMain'))

    const { name, address, phone, taxId, isMain } = validator.parse({
        name: formData.get('name') || undefined,
        address: formData.get('address') || undefined,
        phone: formData.get('phone') || undefined,
        taxId: formData.get('taxId') || undefined,
        isMain: formData.get('isMain'),
    })

    if (addressId) {
        await prisma.address.update({
            where: {
                id: Number(addressId),
            },
            data: {
                addressLine1: address?.split('\n')[0],
                addressLine2: address?.split('\n')[1],
                addressLine3: address?.split('\n')[2],
                phone,
                taxId,
                isMain,
            },
        })
        if (isMain)
            await prisma.address.updateMany({
                where: { contactId: id, id: { not: addressId } },
                data: { isMain: false },
            })
    }

    if (!addressId) {
        const result = await prisma.address.create({
            data: {
                name: name || '',
                addressLine1: address?.split('\n')[0] || undefined,
                addressLine2: address?.split('\n')[1] || undefined,
                addressLine3: address?.split('\n')[2] || undefined,
                phone,
                taxId,
                isMain,
                contactId: id,
            },
        })
        if (isMain)
            await prisma.address.updateMany({
                where: { contactId: id, id: { not: result.id } },
                data: { isMain: false },
            })
    }

    revalidatePath(`/contact/${id}`)
}
