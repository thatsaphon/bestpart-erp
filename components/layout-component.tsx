import { headers } from 'next/headers'
import { AuthPayloadSchema } from '../app/model/payload'
import { Separator } from '@/components/ui/separator'
import { ModeToggle } from '@/components/mode-toggle'
import { NavMenubar } from '@/components/nav-menubar'
import { z } from 'zod'
import UserAvatar from './user-avatar'

export default async function LayoutComponent({
  children,
}: {
  children: React.ReactNode
}) {
  const userObject = JSON.parse(headers().get('user') as string)
  const userValidation = AuthPayloadSchema.safeParse(userObject)

  let user: z.infer<typeof AuthPayloadSchema>
  if (!userValidation.success) return <>{children}</>
  user = userValidation.data

  const upload = async (formData: FormData) => {
    'use server'

    const file = formData.get('file')
    console.log(file)
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <div className='w-screen h-14 flex items-center justify-between pr-5'>
        <a
          className='flex h-7 items-center justify-center rounded-full text-primary
        px-4 text-center text-sm transition-colors font-bold mr-5'
        >
          BestPart Alai
        </a>
        <nav className='flex space-x-6 flex-1'>
          <NavMenubar />
        </nav>
        <div className='mr-2 flex items-center gap-2'>
          <ModeToggle />
          <UserAvatar user={user} />
        </div>
      </div>
      <Separator />

      {children}
    </div>
  )
}
