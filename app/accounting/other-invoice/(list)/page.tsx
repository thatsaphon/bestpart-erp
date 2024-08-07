import prisma from '@/app/db/db'
import { format } from 'date-fns'
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

type Props = {
    searchParams: {
        limit?: string
        page?: string
        from?: string
        to?: string
    }
}

export default async function OtherPaymentPage({
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
    const otherInvoice = await prisma.document.findMany({
        where: {
            documentNo: {
                startsWith: 'INV',
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
                    amount: {
                        lte: 0,
                    },
                },
            },
        },
        orderBy: [{ date: 'desc' }, { documentNo: 'desc' }],
        take: +limit,
        skip: (Number(page) - 1) * Number(limit),
    })
    console.log(otherInvoice)

    const documentCount = await prisma.document.count({
        where: {
            documentNo: {
                startsWith: 'SINV',
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
                        <TableHead>เจ้าหนี้</TableHead>
                        <TableHead>สร้างโดย</TableHead>
                        <TableHead className="text-center">Status</TableHead>
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
                            <TableCell>
                                {invoice.ApSubledger?.Contact.name || '-'}
                            </TableCell>
                            <TableCell>{invoice.createdBy}</TableCell>
                            <TableCell className="text-center">
                                {invoice.ApSubledger?.paymentStatus ===
                                'Paid' ? (
                                    <Badge className="bg-green-400">
                                        จ่ายแล้ว
                                    </Badge>
                                ) : invoice.ApSubledger?.paymentStatus ===
                                  'Billed' ? (
                                    <Badge variant={`secondary`}>
                                        วางบิลแล้ว
                                    </Badge>
                                ) : invoice.ApSubledger?.paymentStatus ===
                                  'PartialPaid' ? (
                                    <Badge variant={'destructive'}>
                                        จ่ายบางส่วน
                                    </Badge>
                                ) : !invoice.ApSubledger ? (
                                    <Badge className="bg-green-400">
                                        เงินสด
                                    </Badge>
                                ) : (
                                    <Badge variant={'destructive'}>
                                        ยังไม่จ่าย
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {(-invoice.GeneralLedger.reduce(
                                    (acc, gl) => acc + gl.amount,
                                    0
                                )).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link
                                    href={`/accounting/other-invoice/${invoice.documentNo}`}
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
