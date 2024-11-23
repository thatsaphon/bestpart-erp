import prisma from '@/app/db/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Metadata } from 'next'
import React from 'react'

type Props = {}
export const metadata: Metadata = {
    title: 'Balance Sheet',
}

export default async function AccountingPage({}: Props) {
    const chartOfAccount = await prisma.chartOfAccount.findMany({
        include: {
            GeneralLedger: true,
        },
        orderBy: {
            id: 'asc',
        },
    })
    return (
        <main className="h-full w-full p-3">
            <h1 className="text-3xl font-bold">งบทดลอง</h1>
            <div className="mb-3 flex flex-wrap gap-3 lg:grid lg:grid-cols-3">
                <Card className="min-h-[250px]">
                    <CardHeader>
                        <CardTitle>Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>รหัส</TableHead>
                                    <TableHead>ชื่อบัญชี</TableHead>
                                    <TableHead className="text-right">
                                        จำนวน
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {chartOfAccount
                                    .filter((item) => item.type === 'Assets')
                                    .map((item) => {
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <span>{item.id}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span>{item.name}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.GeneralLedger.reduce(
                                                        (total, item) =>
                                                            total + item.amount,
                                                        0
                                                    ).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="min-h-[250px]">
                    <CardHeader>
                        <CardTitle>Liabilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>รหัส</TableHead>
                                    <TableHead>ชื่อบัญชี</TableHead>
                                    <TableHead className="text-right">
                                        จำนวน
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {chartOfAccount
                                    .filter(
                                        (item) => item.type === 'Liabilities'
                                    )
                                    .map((item) => {
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <span>{item.id}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span>{item.name}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.GeneralLedger.reduce(
                                                        (total, item) =>
                                                            total + item.amount,
                                                        0
                                                    ).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="min-h-[250px]">
                    <CardHeader>
                        <CardTitle>Equity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>รหัส</TableHead>
                                    <TableHead>ชื่อบัญชี</TableHead>
                                    <TableHead className="text-right">
                                        จำนวน
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {chartOfAccount
                                    .filter(
                                        (item) =>
                                            item.type === 'Equity' ||
                                            item.type === 'Revenue' ||
                                            item.type === 'Expense'
                                    )
                                    .map((item) => {
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <span>{item.id}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span>{item.name}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.GeneralLedger.reduce(
                                                        (total, item) =>
                                                            total + item.amount,
                                                        0
                                                    ).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
