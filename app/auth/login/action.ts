'use server'

import { ZodError, z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import bcrypt from 'bcrypt'
import { prisma } from '@/app/db/db'
import { endOfToday } from 'date-fns'
import { AuthPayloadSchema } from '../payload'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import * as jose from 'jose'

export async function login(formData: FormData) {
    const cookieStore = cookies()
    const username = formData.get('username')
    const password = formData.get('password')

    const validator = z.object({
        username: z.string().trim().min(1, 'Username must not be empty'),
        password: z.string().trim().min(1, 'Password must not be empty')
    })
    try {
        var validated = validator.parse({
            username,
            password
        })
    } catch (err) {
        return {
            error: fromZodError(err as ZodError, { prefix: '', prefixSeparator: '', includePath: false, issueSeparator: '\n' }).message
        }
    }

    const user = await prisma.user.findFirst({ where: { username: validated.username } })
    if (!user) return { error: 'user not found' }
    const result = bcrypt.compareSync(validated.password, user?.password)

    if (!result) return { error: 'wrong username or password' }


    const payload = AuthPayloadSchema.safeParse(user)

    const token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(endOfToday())
        .setIssuedAt(Math.floor(Date.now()))
        .sign(new TextEncoder().encode(process.env.JWT_SECRET))

    cookieStore.set('token', token)

    redirect('/')
    // return { message: 'login successfully' }
}