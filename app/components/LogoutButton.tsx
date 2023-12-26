import { cookies } from 'next/headers'
import React from 'react'

type Props = {}

export default function LogoutButton({}: Props) {
  return (
    <form
      action={async () => {
        cookies().delete('token')
      }}>
      <button className=''>Logout</button>
    </form>
  )
}
