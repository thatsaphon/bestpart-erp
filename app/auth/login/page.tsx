'use client'

import React from 'react'
import { login } from './action'
import toast from 'react-hot-toast'
import { redirect } from 'next/navigation'

type Props = {}

export default function Login({}: Props) {
  return (
    <main className='p-36 h-screen w-screen'>
      <form
        action={async (formData) => {
          const result = await login(formData)
          if (result?.error) return toast.error(result.error)
          // if (result.message) return toast.success(result.message)
        }}>
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
            <button
              type='submit'
              className='p-2 border border-black rounded-md'>
              Login
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}
