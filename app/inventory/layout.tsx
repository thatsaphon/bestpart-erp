import { Separator } from '@/components/ui/separator'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inventory',
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
      <div></div>
      <Separator
        orientation='vertical'
        className='h-full'
      />
      {children}
    </div>
  )
}