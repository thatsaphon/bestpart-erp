'use server'

import { prisma } from '@/app/db/db'
import { Role } from '@prisma/client'
import bcrypt from 'bcrypt'

export async function createUser(formData: FormData) {
    const username = formData.get('username')
    const password = formData.get('password')
    const role = formData.get('role')
    if (typeof username !== 'string') return null
    if (typeof password !== 'string') return null
    if (typeof role !== 'string') return null

    const hashPassword = bcrypt.hashSync(password, +process.env.BCRYPT_SALT)

    await prisma.user.create({
        data: {
            username,
            password: hashPassword,
            role: role as Role,
            flag: `{}`,
        },
    })
}