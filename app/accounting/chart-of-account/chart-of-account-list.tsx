'use client'

import {
    TableBody,
    TableRow,
    TableCell,
    TableHead,
    TableHeader,
    Table,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { ChevronRight, Pencil, ViewIcon } from 'lucide-react'
import React from 'react'
import { ChartOfAccount } from '@prisma/client'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { useParams } from 'next/navigation'
import UpdateChartOfAccountDialog from '@/components/update-chart-of-account-dialog'

type Props = {
    chartOfAccounts: ChartOfAccount[]
}

export default function ChartOfAccountList({ chartOfAccounts }: Props) {
    const [typeExpanded, setTypeExpanded] = React.useState<{
        Assets: boolean
        Liabilities: boolean
        Equity: boolean
        Revenue: boolean
        Expense: boolean
    }>({
        Assets: false,
        Liabilities: false,
        Equity: false,
        Revenue: false,
        Expense: false,
    })
    const [search, setSearch] = React.useState('')
    const params = useParams()

    const filterSearch = (chartOfAccounts: ChartOfAccount[]) => {
        const searchSplit = search.split(' ')
        let result = chartOfAccounts
        for (const word of searchSplit) {
            result = result.filter(
                (item) =>
                    item.name.toUpperCase().includes(word.toUpperCase()) ||
                    String(item.id).includes(word)
            )
        }
        return result
    }

    return (
        <Table className="w-[500px]">
            <TableHeader>
                <TableRow>
                    <TableHead colSpan={2}>
                        <Input
                            placeholder="ค้นหาผังบัญชี"
                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                        />
                    </TableHead>
                    {/* <TableHead className="w-4"></TableHead> */}
                </TableRow>
            </TableHeader>
            <TableBody>
                {Object.entries(typeExpanded).map(([type], index) => (
                    <React.Fragment key={type}>
                        <TableRow>
                            <TableCell className="flex items-center gap-2">
                                <ChevronRight
                                    className={cn(
                                        'h-4 w-4 transition-all hover:cursor-pointer',
                                        typeExpanded[
                                            type as keyof typeof typeExpanded
                                        ] && 'rotate-90'
                                    )}
                                    onClick={() =>
                                        setTypeExpanded((prev) => ({
                                            ...prev,
                                            [type]: !prev[
                                                type as keyof typeof typeExpanded
                                            ],
                                        }))
                                    }
                                />
                                <span>
                                    {index + 1 + '0000'} - {type}
                                </span>
                            </TableCell>
                            <TableCell className="w-4"></TableCell>
                        </TableRow>
                        {typeExpanded[type as keyof typeof typeExpanded] &&
                            filterSearch(chartOfAccounts)
                                .filter(
                                    (chartOfAccount) =>
                                        chartOfAccount.type === type
                                )
                                .map((chartOfAccount, index) => (
                                    <TableRow
                                        key={chartOfAccount.id}
                                        className={cn(
                                            params.accountId ===
                                                String(chartOfAccount.id) &&
                                                'bg-secondary'
                                        )}
                                    >
                                        <TableCell className="relative flex pl-12">
                                            <div
                                                className={cn(
                                                    'absolute -top-7 left-6 h-14 w-4 border-b-2 border-l-2',
                                                    index === 0 && '-top-0 h-7'
                                                )}
                                            ></div>
                                            <Link
                                                href={`/accounting/chart-of-account/${chartOfAccount.id}`}
                                                className="flex-1"
                                            >
                                                {chartOfAccount.id} -{' '}
                                                {chartOfAccount.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="w-4">
                                            <UpdateChartOfAccountDialog
                                                account={chartOfAccount}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                    </React.Fragment>
                ))}
            </TableBody>
        </Table>
    )
}
