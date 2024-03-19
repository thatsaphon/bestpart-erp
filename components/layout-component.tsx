import { Separator } from '@/components/ui/separator'
import { ModeToggle } from '@/components/mode-toggle'
import { NavMenubar } from '@/components/nav-menubar'
import UserAvatar from './user-avatar'
import Link from 'next/link'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { getServerSession } from 'next-auth'

export default async function LayoutComponent({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  const upload = async (formData: FormData) => {
    'use server'

    const file = formData.get('file')
    console.log(file)
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <div className='w-screen h-14 flex items-center justify-between pr-5'>
        <Link
          className='flex h-7 items-center justify-center rounded-full text-primary
        px-4 text-center text-sm transition-colors font-bold mr-5'
          href={'/'}
        >
          BestPart Alai
        </Link>
        <nav className='flex space-x-6 flex-1'>
          <NavMenubar />
        </nav>
        <div className='mr-2 flex items-center gap-2'>
          <ModeToggle />
          <UserAvatar user={session?.user} />
        </div>
      </div>
      <Separator />

      {children}
    </div>
  )
}
