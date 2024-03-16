import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function Home() {
  return (
    <div className='p-5'>
      <h1 className='text-3xl font-bold underline mb-5'>
        Welcome to BestPart Alai
      </h1>
    </div>
  )
}
