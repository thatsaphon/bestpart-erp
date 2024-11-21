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

type Props = {
    searchParams: Promise<{
        limit?: string
        page?: string
        from?: string
        to?: string
    }>
}

export default async function PaymentPage(props: Props) {
    const searchParams = await props.searchParams;

    const {
        limit = '10',
        page = '1',
        from = format(getLastMonth(), 'yyyy-MM-dd'),
        to = format(new Date(), 'yyyy-MM-dd')
    } = searchParams;

    const purchasePayments = await prisma.document.findMany({
        where: {
            type: 'PurchasePayment',
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
        include: {
            PurchasePayment: {
                include: {
                    Contact: true,
                    Purchase: {
                        include: {
                            PurchaseItem: true,
                            Document: true,
                            GeneralLedger: {
                                include: { ChartOfAccount: true },
                            },
                        },
                    },
                    PurchaseReturn: {
                        include: {
                            PurchaseReturnItem: true,
                            Document: true,
                            GeneralLedger: {
                                include: { ChartOfAccount: true },
                            },
                        },
                    },
                    GeneralLedger: {
                        include: {
                            ChartOfAccount: true,
                        },
                    },
                },
            },
            DocumentRemark: {
                include: {
                    User: true,
                },
            },
        },
        orderBy: [{ date: 'desc' }, { documentNo: 'desc' }],
        take: +limit,
        skip: (Number(page) - 1) * Number(limit),
    })

    const documentCount = await prisma.document.count({
        where: {
            type: 'PurchasePayment',
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
                    {purchasePayments.map((payment) => (
                        <TableRow key={payment.documentNo}>
                            <TableCell>
                                {fullDateFormat(payment.date)}
                            </TableCell>
                            <TableCell>{payment.documentNo}</TableCell>
                            <TableCell>{payment.referenceNo}</TableCell>
                            <TableCell>
                                {payment.PurchasePayment?.Contact.name ||
                                    'เงินสด'}
                            </TableCell>
                            <TableCell className="text-right">
                                {payment.PurchasePayment?.GeneralLedger.reduce(
                                    (
                                        a,
                                        {
                                            amount,
                                            ChartOfAccount: {
                                                isCash,
                                                isDeposit,
                                            },
                                        }
                                    ) => (isCash ? a + -amount : a),
                                    0
                                ).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link
                                    href={`/purchase/purchase-payment/${payment.documentNo}`}
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
