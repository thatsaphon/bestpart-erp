'use client'

import { login } from '@/app/auth/login/action'
import toast from 'react-hot-toast'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Props = {}

export default function LoginComponent({}: Props) {
  const router = useRouter()
  return (
    <form
      action={async (formData) => {
        const result = await signIn('credentials', {
          redirect: false,
          username: formData.get('username'),
          password: formData.get('password'),
        })
        if (result?.error) {
          console.error(result.error)
        } else {
          router.push('/')
          router.refresh()
        }
        if (result?.error) return toast.error(result.error)
      }}
    >
      <div className='border-black border flex flex-col gap-2 rounded-md w-full p-12'>
        <div className='grid grid-cols-[100px_200px] justify-center items-center'>
          <label htmlFor='username'>Username</label>
          <input
            id='username'
            name='username'
            type='text'
            className='my-2 border border-black px-2'
          />
        </div>
        <div className='grid grid-cols-[100px_200px] justify-center items-center'>
          <label htmlFor='password'>Password</label>
          <input
            id='password'
            name='password'
            type='password'
            className='my-2 border border-black px-2'
          />
        </div>
        <div className='text-center'>
          <button type='submit' className='p-2 border border-black rounded-md'>
            Login
          </button>
        </div>
      </div>
    </form>
  )
}
