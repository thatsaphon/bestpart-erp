import React from 'react'
import { headers } from 'next/headers'
import { AuthPayloadSchema } from '../../model/payload'
import CreateUserForm from '@/components/create-user-form'
import { redirect } from 'next/navigation'

type Props = {}

export default function CreateUser({}: Props) {
  const userJSON = headers().get('user')
  const userObject = JSON.parse(userJSON as string)
  const user = AuthPayloadSchema.safeParse(userObject)
  if (!user.success) redirect('/auth/login')
  if (user.data.role !== 'ADMIN') redirect('/auth/login')
  return (
    <main className='p-36 h-screen w-screen'>
      <CreateUserForm />
    </main>
  )
}
