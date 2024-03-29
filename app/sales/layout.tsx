import SubMenuNavLink from '@/components/submenu-navlink'
import { Separator } from '@/components/ui/separator'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sales',
  //   description:
  //     'Generated by create next app',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='grid grid-cols-[200px_5px_1fr] flex-1'>
      <div className='flex flex-col items-center text-center'>
        <Separator />
        <SubMenuNavLink href='/sales' label='Sales' />
        <Separator />
      </div>
      <Separator orientation='vertical' className='h-full' />
      {children}
    </div>
  )
}
