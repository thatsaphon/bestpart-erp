import LoginComponent from '@/components/login-component'
import React from 'react'
import { authOptions } from '../api/auth/[...nextauth]/authOptions'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

type Props = {}

export default async function page({}: Props) {
    const session = await getServerSession(authOptions)
    if (session) return redirect('/')

    return (
        <main className="h-screen w-screen p-36">
            <LoginComponent />
        </main>
    )
}
