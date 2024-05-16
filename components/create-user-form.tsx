'use client'

import React from 'react'
import { createUser } from '@/app/auth/create/action'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'

type Props = {}

export default function CreateUserForm({}: Props) {
    const session = useSession()

    return session.data?.user.role === 'ADMIN' ? (
        <form
            action={async (formData) => {
                await createUser(formData)
                toast.success('Successful')
            }}
        >
            <div className="flex w-full flex-col gap-2 rounded-md border border-black p-12">
                <div className="grid grid-cols-[100px_200px] items-center justify-center gap-2 text-center">
                    <label htmlFor="new-username">Username</label>
                    <input
                        id="new-username"
                        name="username"
                        type="text"
                        className="my-2 border border-black"
                    />
                </div>
                <div className="grid grid-cols-[100px_200px] items-center justify-center gap-2 text-center">
                    <label htmlFor="new-password">Password</label>
                    <input
                        id="new-password"
                        name="password"
                        type="password"
                        className="my-2 border border-black"
                    />
                </div>
                <div className="grid grid-cols-[100px_200px] items-center justify-center gap-2 text-center">
                    <label htmlFor="new-password">Role</label>
                    <select
                        id="role"
                        name="role"
                        className="my-2 border border-black"
                    >
                        <option value="SALES">พนักงานขาย</option>
                        <option value="BACKOFFICE">คลังสินค้า</option>
                        <option value="FINANCE">การเงิน</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
                <div className="text-center">
                    <button
                        className="rounded-md border border-black p-2"
                        type="submit"
                    >
                        Create
                    </button>
                </div>
            </div>
        </form>
    ) : (
        <>Unauthorized</>
    )
}
