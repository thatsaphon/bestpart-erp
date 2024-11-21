import React, { Fragment } from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import ChartOfAccountDialog from '@/components/chart-of-account-dialog'
import prisma from '../../db/db'
import ResetChartOfAccountDialog from '@/components/reset-chart-of-account-dialog'
import { revalidatePath } from 'next/cache'
import { promises as fs } from 'fs'
import { csvToJSONObject } from '@/lib/csvToObject'
import { chartOfAccountSchema } from '../../schema/chart-of-accounts-schema'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import ChartOfAccountDetailDialog from '@/components/chart-of-account-detail-dialog'
import Link from 'next/link'
// import { URLSearchParams } from 'url'
import { createQueryString } from '@/lib/searchParams'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Collapsible } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import ChartOfAccountList from './chart-of-account-list'

type Props = {
    searchParams: Promise<{ accountId?: string }>
    children: React.ReactNode
    detail: React.ReactNode
}

export const revalidate = 600

export default async function AccountingPageTemplate(props: Props) {
    const searchParams = await props.searchParams

    const chartOfAccounts = await prisma.chartOfAccount.findMany({})

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
            <div className="flex flex-col gap-x-3">
                <h1 className="text-3xl font-bold">Chart of Account</h1>
            </div>
            {/* <div className="p-6"></div> */}
            <div className="flex gap-2">
                <ChartOfAccountList chartOfAccounts={chartOfAccounts} />
                {props.detail}
            </div>
        </main>
    )
}
