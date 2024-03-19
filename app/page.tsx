import LoginComponent from '@/components/login-component'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/authOptions'

export default async function Home() {
  return (
    <div className='p-5'>
      <h1 className='text-3xl font-bold underline mb-5'>
        Welcome to BestPart Alai
      </h1>
    </div>
  )
}
