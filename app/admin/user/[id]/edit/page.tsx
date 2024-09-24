import prisma from '@/app/db/db'
import React from 'react'
import EditUserForm from './edit-user-form'

type Props = {
    params: { id: string }
}

export default async function EditUserPage({ params: { id } }: Props) {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            role: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
        },
    })

    if (!user)
        return (
            <div className="items-center text-center text-2xl transition-colors">
                ไม่พบผู้ใช้งาน
            </div>
        )

    return (
        <>
            <h2 className="my-3 flex items-center gap-3 text-2xl font-semibold transition-colors">
                จัดการผู้ใช้งาน
            </h2>
            <EditUserForm user={user} />
        </>
    )
}
