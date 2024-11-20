import React from 'react'
import CreateUserForm from './create-user-form'
import prisma from '@/app/db/db'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { getServerSession } from 'next-auth'

type Props = {}

export default async function CreateUserPage({}: Props) {
    const session = await getServerSession(authOptions)
    const userCount = await prisma.user.count()
    const cookieStore = await cookies()
    if (!session) {
        console.log('userCount', userCount)
    }
    if (!session && userCount > 0) {
        return notFound()
    }
    if (!session && cookieStore.get('create-first-user')?.value !== 'true') {
        return notFound()
    }
    return (
        <>
            <h2 className="my-3 flex items-center gap-3 text-2xl font-semibold transition-colors">
                สร้างผู้ใช้งานใหม่
            </h2>
            <CreateUserForm />
        </>
    )
}
