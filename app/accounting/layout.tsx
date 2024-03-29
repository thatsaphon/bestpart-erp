import SubMenuNavLink from '@/components/submenu-navlink'
import { Separator } from '@/components/ui/separator'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Accounting',
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
        <SubMenuNavLink href='/accounting' label='Chart of Account' />
        <Separator />
        <SubMenuNavLink
          href='/accounting/balance-sheet'
          label='Balance Sheet'
        />
        <Separator />
        <SubMenuNavLink href='/accounting/cash' label='Cash' />
        <Separator />
        <SubMenuNavLink href='/accounting/land-ppe' label='Land and PP&E' />
        <Separator />
      </div>
      <Separator orientation='vertical' className='h-full' />
      {children}
    </div>
  )
}
