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
import prisma from '../../db/db'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import PaginationComponent from '@/components/pagination-component'
import { format } from 'date-fns'

type Props = {
    searchParams: {
        limit?: string
        page?: string
        from?: string
        to?: string
    }
}

export default async function PurchasePage({
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
            documentId: {
                startsWith: 'PINV',
            },
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
            ApSubledger: {
                select: {
                    Contact: true,
                    paymentStatus: true,
                },
            },
            GeneralLedger: {
                where: {
                    chartOfAccountId: {
                        in: [21000, 11000],
                    },
                },
            },
        },
        orderBy: [{ date: 'desc' }, { documentId: 'desc' }],
        take: +limit,
        skip: (Number(page) - 1) * Number(limit),
    })

    const documentCount = await prisma.document.count({
        where: {
            documentId: {
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
                        <TableHead className="w-[100px]">Ref</TableHead>
                        <TableHead>คู่ค้า</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {purchaseInvoices.map((invoice) => (
                        <TableRow key={invoice.documentId}>
                            <TableCell>
                                {new Intl.DateTimeFormat('th-TH', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    timeZone: 'Asia/Bangkok', // Set time zone to Bangkok
                                    localeMatcher: 'best fit',
                                }).format(invoice.date)}
                            </TableCell>
                            <TableCell>{invoice.documentId}</TableCell>
                            <TableCell>{invoice.referenceId}</TableCell>
                            <TableCell>
                                {invoice.ApSubledger?.Contact.name || 'เงินสด'}
                            </TableCell>
                            <TableCell>
                                {invoice.ApSubledger?.paymentStatus || 'Paid'}
                            </TableCell>
                            <TableCell className="text-right">
                                {Math.abs(
                                    invoice.GeneralLedger[0]?.amount
                                ).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link href={`/purchase/${invoice.documentId}`}>
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
