import React from 'react'
import LoginComponent from '@/app/components/LoginComponent'
import { cookies, headers } from 'next/headers'
import { RedirectType, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type Props = {}

export const dynamic = 'force-dynamic'

export default function Login({}: Props) {
  const user = headers().get('user')
  async function logout() {
    'use server'
    cookies().delete('token')
    revalidatePath('/auth/login')
    redirect('/auth/login', RedirectType.replace)
  }
  if (!user || !cookies().has('token'))
    return (
      <main className='p-36 h-screen w-screen'>
        <LoginComponent />
      </main>
    )

  if (user && cookies().has('token'))
    return (
      <>
        <main className='p-36 h-screen w-screen flex justify-center items-center'>
          <form action={logout}></form>
          <a href='/' className='p-2 bg-neutral-700 text-white rounded-md mr-2'>
            Home Page
          </a>
          <button
            className='p-2 bg-amber-900 text-white rounded-md'
            type='submit'>
            Logout
          </button>
        </main>
      </>
    )
}
