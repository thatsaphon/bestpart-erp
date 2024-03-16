import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

type Props = {}

export default async function AccountingPage({}: Props) {
  // const chartOfAccount = await prisma.chartOfAccount.findMany()
  return (
    <main className='p-3 h-full w-full'>
      <h1 className='text-3xl font-bold'>Balance sheet</h1>
      <div className='flex flex-wrap lg:grid lg:grid-cols-3 mb-3 gap-3'>
        {/* <div className='border-2 rounded-lg gap-2 min-h-[250px]'></div>
        <div className='border-2 rounded-lg gap-2 min-h-[250px]'></div>
        <div className='border-2 rounded-lg gap-2 min-h-[250px]'></div> */}
        <Card className='min-h-[250px] max-w-[350px] w-full'>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
        <Card className='min-h-[250px] max-w-[350px] w-full'>
          <CardHeader>
            <CardTitle>Liabilities</CardTitle>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
        <Card className='min-h-[250px] max-w-[350px] w-full'>
          <CardHeader>
            <CardTitle>Equity</CardTitle>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      </div>
    </main>
  )
}
