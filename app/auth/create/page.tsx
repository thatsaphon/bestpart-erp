'use client'

import React from 'react'
import { createUser } from './action'
import toast from 'react-hot-toast'

type Props = {}

export default function CreateUser({}: Props) {
  return (
    <main className='p-36 h-screen w-screen'>
      <form
        action={async (formData) => {
          await createUser(formData)
          toast.success('Successful')
        }}>
        <div className='border-black border flex flex-col gap-2 rounded-md w-full p-12'>
          <div className='text-center grid grid-cols-[100px_200px] justify-center items-center gap-2'>
            <label htmlFor='new-username'>Username</label>
            <input
              id='new-username'
              name='username'
              type='text'
              className='my-2 border border-black'
            />
          </div>
          <div className='text-center grid grid-cols-[100px_200px] justify-center items-center gap-2'>
            <label htmlFor='new-password'>Password</label>
            <input
              id='new-password'
              name='password'
              type='password'
              className='my-2 border border-black'
            />
          </div>
          <div className='text-center grid grid-cols-[100px_200px] justify-center items-center gap-2'>
            <label htmlFor='new-password'>Role</label>
            <select id='role' name='role' className='my-2 border border-black'>
              <option value='ADMIN'>Admin</option>
              <option value='USER'>User</option>
            </select>
          </div>
          <div className='text-center'>
            <button
              className='p-2 border border-black rounded-md'
              type='submit'>
              Create
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}
