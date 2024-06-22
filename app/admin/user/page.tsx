import prisma from '@/app/db/db'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableRow,
    TableFooter,
    TableHeader,
} from '@/components/ui/table'
import { Edit2Icon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {}

export default async function UserPage({}: Props) {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            avatarUrl: true,
            role: true,
            flag: true,
        },
    })

    return (
        <>
            <h2 className="my-3 flex items-center gap-3 text-2xl font-semibold transition-colors">
                <span>ผู้ใช้งาน</span>
                <Link href={'/admin/user/create'}>
                    <Button className="" variant={'outline'} type="button">
                        สร้างผู้ใช้
                    </Button>
                </Link>
            </h2>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ที่</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>ชื่อ</TableHead>
                        <TableHead>ตำแหน่ง</TableHead>
                        <TableHead></TableHead>
                        {/* <TableHeader>last login</TableHeader>
                        <TableHeader>created at</TableHeader> */}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user, index) => (
                        <TableRow key={user.username}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>
                                {user.first_name} {user.last_name}
                            </TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                                <Link href={`/admin/user/${user.id}`}>
                                    <Edit2Icon className="h-4 w-4" />
                                </Link>
                            </TableCell>
                            {/* <TableCell>{user.flag}</TableCell>
                            <TableCell>{user.created_at}</TableCell> */}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}
