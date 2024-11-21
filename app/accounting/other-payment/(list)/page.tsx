import {
    Table,
    TableCaption,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table'
import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import PaginationComponent from '@/components/pagination-component'
import { endOfDay, format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import prisma from '@/app/db/db'
import { fullDateFormat } from '@/lib/date-format'
import { getLastMonth } from '@/lib/get-last-month'
import { getOtherPaymentDefaultFunction } from '@/types/other-payment/other-payment'
import { generalLedgerToPayments } from '@/types/payment/payment'

type Props = {
    searchParams: Promise<{
        limit?: string
        page?: string
        from?: string
        to?: string
    }>
}

export default async function OtherPaymentPage(props: Props) {
    const searchParams = await props.searchParams;

    const {
        limit = '10',
        page = '1',
        from = format(getLastMonth(), 'yyyy-MM-dd'),
        to = format(new Date(), 'yyyy-MM-dd')
    } = searchParams;

    const otherPayments = await getOtherPaymentDefaultFunction({
        where: {
            type: 'OtherPayment',
            AND: [
                {
                    date: {
                        gte: new Date(from),
                    },
                },
                {
                    date: {
                        lt: endOfDay(to),
                    },
                },
            ],
        },
        orderBy: [{ date: 'desc' }, { documentNo: 'desc' }],
        take: +limit,
        skip: (Number(page) - 1) * Number(limit),
    })

    const documentCount = await prisma.document.count({
        where: {
            type: 'OtherPayment',
        },
    })
    const numberOfPage = Math.ceil(documentCount / Number(limit))

    return (
        <>
            <Table>
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[150px]">วันที่</TableHead>
                        <TableHead className="w-[100px]">
                            เลขที่เอกสาร
                        </TableHead>
                        <TableHead className="w-[100px]">Ref</TableHead>
                        <TableHead>คู่ค้า</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {otherPayments.map((payment) => (
                        <TableRow key={payment.documentNo}>
                            <TableCell>
                                {fullDateFormat(payment.date)}
                            </TableCell>
                            <TableCell>{payment.documentNo}</TableCell>
                            <TableCell>{payment.referenceNo}</TableCell>
                            <TableCell>
                                {payment.OtherPayment?.Contact.name || 'เงินสด'}
                            </TableCell>
                            <TableCell className="text-right">
                                {generalLedgerToPayments(
                                    payment.OtherPayment?.GeneralLedger,
                                    { isCash: true },
                                    true
                                )
                                    .reduce(
                                        (acc, { amount }) => acc + amount,
                                        0
                                    )
                                    .toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link
                                    href={`/accounting/other-payment/${payment.documentNo}`}
                                >
                                    <EyeOpenIcon />
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <PaginationComponent
                page={page}
                limit={limit}
                numberOfPage={numberOfPage}
            />
        </>
    )
}
