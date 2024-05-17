import React from 'react'
import { headers } from 'next/headers'
import { AuthPayloadSchema } from '../../schema/authPayloadSchema'
import CreateUserForm from '@/components/create-user-form'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

type Props = {}

export default async function CreateUser({}: Props) {
    const session = await getServerSession(authOptions)

    if (session?.user.role !== 'ADMIN') {
        return <>Unauthorized</>
    }

    return (
        <main className="h-screen w-screen p-36">
            <CreateUserForm />
        </main>
    )
}
