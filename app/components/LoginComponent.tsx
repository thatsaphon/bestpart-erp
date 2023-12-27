'use client'

import toast from 'react-hot-toast'
import { login } from '../auth/login/action'

type Props = {}

export default function LoginComponent({}: Props) {
  return (
    <form
      action={async (formData) => {
        const result = await login(formData)
        if (result?.error) return toast.error(result.error)
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
          <button type='submit' className='p-2 border border-black rounded-md'>
            Login
          </button>
        </div>
      </div>
    </form>
  )
}
