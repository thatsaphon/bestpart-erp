import prisma from '@/app/db/db'
import { Button } from '@/components/ui/button'
import { Edit2Icon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
    params: Promise<{ id: string }>
}

export default async function UserPage(props: Props) {
    const params = await props.params;

    const {
        id
    } = params;

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
                <span>จัดการผู้ใช้งาน</span>
                <Link href={`/admin/user/${user?.id}/edit`}>
                    <Edit2Icon className="h-5 w-5" />
                </Link>
            </h2>

            <p>Username: {user?.username}</p>
            <p>ชื่อ: {user?.first_name}</p>
            <p>นามสกุล: {user?.last_name}</p>
            <p>ตำแหน่ง : {user?.role}</p>
        </>
    )
}
