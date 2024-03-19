import LoginComponent from '@/components/login-component'
import { getServerSession } from 'next-auth'

export default async function Home() {
  const session = await getServerSession()

  if (!session)
    return (
      <>
        <main className='p-36 h-screen w-screen'>
          <LoginComponent />
        </main>
      </>
    )
  return (
    <div className='p-5'>
      <h1 className='text-3xl font-bold underline mb-5'>
        Welcome to BestPart Alai
      </h1>
    </div>
  )
}
