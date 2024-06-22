'use server'

import prisma from '@/app/db/db'
import { Role } from '@prisma/client'
import bcrypt from 'bcrypt'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export const createUser = async (formData: FormData) => {
    const validator = z.object({
        username: z.string().trim().min(1, 'username must not be empty'),
        password: z.string().trim().min(1, 'password must not be empty'),
        first_name: z.string().trim(),
        last_name: z.string().trim(),
        role: z.nativeEnum(Role),
    })

    const { username, password, first_name, last_name, role } = validator.parse(
        {
            username: formData.get('username'),
            password: formData.get('password'),
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            role: formData.get('role'),
        }
    )

    const hashPassword = bcrypt.hashSync(password, +process.env.BCRYPT_SALT)
    await prisma.user.create({
        data: {
            username,
            first_name,
            last_name,
            password: hashPassword,
            role: role as Role,
            flag: {},
        },
    })

    revalidatePath('/admin/user')
    redirect('/admin/user')
}
