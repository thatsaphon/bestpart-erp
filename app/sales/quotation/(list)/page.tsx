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
import prisma from '@/app/db/db'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import PaginationComponent from '@/components/pagination-component'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

type Props = {
    searchParams: {
        limit?: string
        page?: string
        from?: string
        to?: string
    }
}

export default async function PurchaseOrderPage({
    searchParams: {
        limit = '10',
        page = '1',
        from = format(
            new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            'yyyy-MM-dd'
        ),
        to = format(new Date(), 'yyyy-MM-dd'),
    },
}: Props) {
    const purchaseInvoices = await prisma.document.findMany({
        where: {
            type: 'Quotation',
            AND: [
                {
                    date: {
                        gte: new Date(from),
                    },
                },
                {
                    date: {
                        lt: new Date(
                            new Date(to).setDate(new Date(to).getDate() + 1)
                        ),
                    },
                },
            ],
        },
        include: {
            Quotation: {
                include: {
                    QuotationItem: true,
                    Contact: true,
                },
            },
            // ApSubledger: {
            //     select: {
            //         Contact: true,
            //         paymentStatus: true,
            //     },
            // },
            // GeneralLedger: {
            //     where: {
            //         chartOfAccountId: {
            //             in: [21000, 11000],
            //         },
            //     },
            // },
        },
        orderBy: [{ date: 'desc' }, { documentNo: 'desc' }],
        take: +limit,
        skip: (Number(page) - 1) * Number(limit),
    })

    const documentCount = await prisma.document.count({
        where: {
            documentNo: {
                startsWith: 'PINV',
            },
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
                        <TableHead>ลูกค้า</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {purchaseInvoices.map((invoice) => (
                        <TableRow key={invoice.documentNo}>
                            <TableCell>
                                {new Intl.DateTimeFormat('th-TH', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    timeZone: 'Asia/Bangkok', // Set time zone to Bangkok
                                    localeMatcher: 'best fit',
                                }).format(invoice.date)}
                            </TableCell>
                            <TableCell>{invoice.documentNo}</TableCell>
                            <TableCell>
                                {invoice.Quotation?.Contact?.name || 'เงินสด'}
                            </TableCell>
                            <TableCell className="text-right">
                                {Math.abs(
                                    invoice.Quotation?.QuotationItem.reduce(
                                        (total, item) =>
                                            total +
                                            (item.price + item.vat) *
                                                item.quantity,
                                        0
                                    ) || 0
                                ).toLocaleString()}
                                {/* {Math.abs(
                                    invoice.GeneralLedger[0]?.amount
                                ).toLocaleString()} */}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link
                                    href={`/sales/quotation/${invoice.documentNo}`}
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
