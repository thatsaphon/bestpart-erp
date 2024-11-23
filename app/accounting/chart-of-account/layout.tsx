import React from 'react'
import prisma from '../../db/db'
import { revalidatePath } from 'next/cache'
import { promises as fs } from 'fs'
import { csvToJSONObject } from '@/lib/csvToObject'
import { chartOfAccountSchema } from '../../schema/chart-of-accounts-schema'
// import { URLSearchParams } from 'url'
import ChartOfAccountList from './chart-of-account-list'
import ChartOfAccountDialog from '@/components/chart-of-account-dialog'

type Props = {
    searchParams: Promise<{ accountId?: string }>
    children: React.ReactNode
    detail: React.ReactNode
}

export const revalidate = 600

export default async function AccountingPageTemplate(props: Props) {
    const searchParams = await props.searchParams

    const chartOfAccounts = await prisma.chartOfAccount.findMany({
        orderBy: { id: 'asc' },
    })

    const resetChartOfAccount = async () => {
        'use server'
        const file = await fs.readFile(
            process.cwd() + `/master-data/chart-of-accounts.csv`,
            'utf8'
        )
        const result = await csvToJSONObject(file)
        const validated = chartOfAccountSchema.array().safeParse(result)

        if (!validated.success) {
            return {
                error: 'invalid data',
            }
        }

        await prisma.chartOfAccount.deleteMany({})
        await prisma.chartOfAccount.createMany({
            data: validated.data,
        })
        revalidatePath('/accounting/chart-of-account')
    }

    return (
        <main className="h-full w-full p-3">
            <div className="flex gap-x-3">
                <h1 className="text-3xl font-bold">Chart of Account</h1>
                <ChartOfAccountDialog label="เพิ่มบัญชี" />
            </div>
            {/* <div className="p-6"></div> */}
            <div className="flex items-start justify-start gap-4">
                <div className="w-[500px]">
                    <ChartOfAccountList chartOfAccounts={chartOfAccounts} />
                </div>
                <div className="rounded-md border-2 border-dashed p-4">
                    {props.detail}
                </div>
            </div>
        </main>
    )
}
