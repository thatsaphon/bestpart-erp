'use server'

import prisma from '@/app/db/db'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export const editUser = async (id: string, formData: FormData) => {
    const validator = z.object({
        first_name: z.string().trim(),
        last_name: z.string().trim(),
        role: z.nativeEnum(Role),
    })

    const { first_name, last_name, role } = validator.parse({
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        role: formData.get('role'),
    })

    const user = await prisma.user.findUnique({
        where: { id },
    })

    if (!user) {
        throw new Error('User not found')
    }

    await prisma.user.update({
        where: { id },
        data: {
            first_name,
            last_name,
            role,
        },
    })

    revalidatePath('/admin/user')
    redirect('/admin/user/' + id)
}
