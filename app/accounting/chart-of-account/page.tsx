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
}

export const revalidate = 600

export default async function AccountingPage(props: Props) {
    return <></>
}
