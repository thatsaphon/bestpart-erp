import prisma from '@/app/db/db'
import { endOfDay, format } from 'date-fns'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import PaginationComponent from '@/components/pagination-component'
import { Badge } from '@/components/ui/badge'
import React from 'react'
import Link from 'next/link'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import { fullDateFormat } from '@/lib/date-format'
import { generalLedgerToPayments } from '@/types/payment/payment'
import { getOtherInvoiceDefaultFunction } from '@/types/other-invoice/other-invoice'
import { getLastMonth } from '@/lib/get-last-month'
import { getJournalVoucherDefaultFunction } from '@/types/journal-voucher/journal-voucher'

type Props = {
    searchParams: Promise<{
        limit?: string
        page?: string
        from?: string
        to?: string
    }>
}

export default async function JournalVoucherListPage(props: Props) {
    const searchParams = await props.searchParams;

    const {
        limit = '10',
        page = '1',
        from = format(getLastMonth(), 'yyyy-MM-dd'),
        to = format(new Date(), 'yyyy-MM-dd')
    } = searchParams;

    const otherInvoice = await getJournalVoucherDefaultFunction({
        where: { type: 'JournalVoucher' },
        orderBy: [{ date: 'desc' }, { documentNo: 'desc' }],
        take: +limit,
        skip: (Number(page) - 1) * Number(limit),
    })

    const documentCount = await prisma.document.count({
        where: {
            type: 'JournalVoucher',
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
                        <TableHead>สร้างโดย</TableHead>
                        <TableHead>คำอธิบาย</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {otherInvoice.map((invoice) => (
                        <TableRow key={invoice.documentNo}>
                            <TableCell>
                                {fullDateFormat(invoice.date)}
                            </TableCell>
                            <TableCell>{invoice.documentNo}</TableCell>
                            <TableCell>{invoice.createdBy}</TableCell>
                            <TableCell>
                                {invoice.JournalVoucher?.journalDescription}
                            </TableCell>
                            <TableCell className="text-right">
                                {invoice.JournalVoucher?.GeneralLedger.filter(
                                    ({ amount }) => amount > 0
                                )
                                    .reduce((acc, item) => acc + item.amount, 0)
                                    .toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link
                                    href={`/accounting/journal-voucher/${invoice.documentNo}`}
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
