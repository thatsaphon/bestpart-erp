import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Metadata } from 'next'
import React from 'react'

type Props = {}
export const metadata: Metadata = {
    title: 'Balance Sheet',
}

export default async function AccountingPage({}: Props) {
    // const chartOfAccount = await prisma.chartOfAccount.findMany()
    return (
        <main className="h-full w-full p-3">
            <h1 className="text-3xl font-bold">Balance sheet</h1>
            <div className="mb-3 flex flex-wrap gap-3 lg:grid lg:grid-cols-3">
                {/* <div className='border-2 rounded-lg gap-2 min-h-[250px]'></div>
        <div className='border-2 rounded-lg gap-2 min-h-[250px]'></div>
        <div className='border-2 rounded-lg gap-2 min-h-[250px]'></div> */}
                <Card className="min-h-[250px] w-full max-w-[350px]">
                    <CardHeader>
                        <CardTitle>Assets</CardTitle>
                    </CardHeader>
                    <CardContent></CardContent>
                </Card>
                <Card className="min-h-[250px] w-full max-w-[350px]">
                    <CardHeader>
                        <CardTitle>Liabilities</CardTitle>
                    </CardHeader>
                    <CardContent></CardContent>
                </Card>
                <Card className="min-h-[250px] w-full max-w-[350px]">
                    <CardHeader>
                        <CardTitle>Equity</CardTitle>
                    </CardHeader>
                    <CardContent></CardContent>
                </Card>
            </div>
        </main>
    )
}
