import { getChartOfAccountHistory } from '@/actions/chart-of-account-history'
import prisma from '@/app/db/db'
import ChartOfAccountDetailDialog from '@/components/chart-of-account-detail-dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { shortDateFormat } from '@/lib/date-format'
import React from 'react'

type Props = {
    params: Promise<{ accountId: string }>
    searchParams: Promise<{ accountId: string }>
}

export default async function page(props: Props) {
    const params = await props.params
    const searchParams = await props.searchParams
    const accountDetail = await prisma.chartOfAccount.findUnique({
        where: { id: params.accountId ? +params.accountId : 0 },
        include: { GeneralLedger: { include: {} }, AccountOwner: true },
    })
    const history = await getChartOfAccountHistory(+params.accountId)
    const dialogAccountDetail = await prisma.chartOfAccount.findUnique({
        where: { id: searchParams.accountId ? +searchParams.accountId : 0 },
        include: { GeneralLedger: true, AccountOwner: true },
    })
    return (
        <div className="w-full">
            <h1>
                {params.accountId} - {accountDetail?.name}
            </h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>วันที่</TableHead>
                        <TableHead>เลขที่</TableHead>
                        <TableHead>จำนวนเงิน</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                {shortDateFormat(item.Document?.date)}
                            </TableCell>
                            <TableCell>{item.Document?.documentNo}</TableCell>
                            <TableCell>
                                {item.amount.toLocaleString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <ChartOfAccountDetailDialog
                key={searchParams.accountId}
                account={dialogAccountDetail}
            />
        </div>
    )
}
