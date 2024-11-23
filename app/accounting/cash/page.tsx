import prisma from '@/app/db/db'
import CashAccountDialog from '@/components/cash-account-dialog'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import React, { Fragment } from 'react'
import { Prisma } from '@prisma/client'
import { AuthPayloadSchema } from '@/app/schema/authPayloadSchema'
import { Metadata } from 'next'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { getChartOfAccountMovement } from '@/actions/chart-of-account-movement'
import { endOfDay, startOfDay } from 'date-fns'

type Props = {}
export const metadata: Metadata = {
    title: 'Cash',
}

export default async function CashPage({}: Props) {
    // const users = await prisma.user.findMany({
    //     select: {
    //         username: true,
    //         first_name: true,
    //         last_name: true,
    //         AccountOwner: { select: { chartOfAccountId: true } },
    //         role: true,
    //         avatarUrl: true,
    //     },
    // })

    const chartOfAccounts = await prisma.chartOfAccount.findMany({
        where: {
            isCash: true,
        },
    })
    const balance = await prisma.generalLedger.groupBy({
        by: ['chartOfAccountId'],
        _sum: {
            amount: true,
        },
        where: {
            chartOfAccountId: {
                in: chartOfAccounts.map((x) => x.id),
            },
        },
    })
    const todayChanges = await getChartOfAccountMovement(
        chartOfAccounts.map((x) => x.id),
        startOfDay(new Date()),
        endOfDay(new Date())
    )

    return (
        <main className="max-w-[724px] p-3">
            <div className="mb-3 flex items-center justify-between">
                <h1 className="text-3xl font-bold">เงินสด</h1>
                <Card>
                    <CardContent className="py-2">
                        <p className="h-full">Account Number: 11000</p>
                    </CardContent>
                </Card>
            </div>
            <div className="p-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>รหัสบัญชี</TableHead>
                            <TableHead>ชื่อบัญชี</TableHead>
                            <TableHead className="text-right">
                                ยอดคงเหลือ
                            </TableHead>
                            <TableHead className="text-right">วันนี้</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {chartOfAccounts.map((chartOfAccount) => (
                            <TableRow key={chartOfAccount.id}>
                                <TableCell>{chartOfAccount.id}</TableCell>
                                <TableCell>{chartOfAccount.name}</TableCell>
                                <TableCell className="text-right">
                                    {balance
                                        .find(
                                            (x) =>
                                                x.chartOfAccountId ===
                                                chartOfAccount.id
                                        )
                                        ?.['_sum']?.amount?.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {todayChanges.items
                                        .find(
                                            (x) =>
                                                x.chartOfAccountId ===
                                                chartOfAccount.id
                                        )
                                        ?.amount?.toLocaleString() || '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </main>
    )
}
