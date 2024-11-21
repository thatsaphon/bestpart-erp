'use client'

import prisma from '@/app/db/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Prisma, Role } from '@prisma/client'
import React from 'react'
import toast from 'react-hot-toast'
import { editUser } from './edit-user'

const filteredUser = Prisma.validator<Prisma.UserDefaultArgs>()({
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

type Props = {
    user: Prisma.UserGetPayload<typeof filteredUser>
}

export default function EditUserForm({ user }: Props) {
    // const [error, action, isPending] = useActionState(editUser, null)
    return (
        <form
            className="grid w-[500px] grid-cols-[1fr_400px] items-center gap-3"
            action={async (formData) => {
                try {
                    await editUser(user.id, formData)
                    toast.success('บันทึกข้อมูลสําเร็จ')
                } catch (err) {
                    if (err instanceof Error) return toast.error(err.message)

                    toast.error('Something went wrong')
                }
            }}
        >
            <span className="text-right">Username: </span>
            <span>{user?.username}</span>
            <span className="text-right">ชื่อ: </span>
            <Input
                className="w-auto"
                name="first_name"
                defaultValue={user?.first_name || ''}
            />
            <span className="text-right">นามสกุล: </span>
            <Input
                className="w-auto"
                name="last_name"
                defaultValue={user?.last_name || ''}
            />
            <span className="text-right">ตำแหน่ง : </span>
            <Select defaultValue={user?.role} name="role">
                <SelectTrigger className="w-auto">
                    <SelectValue
                        defaultValue={user?.role}
                        placeholder="เลือกตำแหน่ง"
                    />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>เลือกตำแหน่ง</SelectLabel>
                        {Object.entries(Role).map(([key, value]) => (
                            <SelectItem key={key} value={value}>
                                {value}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <div className="col-span-2 flex justify-center">
                <Button type="submit">Submit</Button>
            </div>
        </form>
    )
}
