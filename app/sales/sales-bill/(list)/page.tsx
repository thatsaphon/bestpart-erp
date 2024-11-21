import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import prisma from '../../../db/db'
import PaginationComponent from '@/components/pagination-component'
import { ViewIcon } from 'lucide-react'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import { Prisma } from '@prisma/client'
import { cn } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Fragment } from 'react'
import { Badge } from '@/components/ui/badge'
import { fullDateFormat } from '@/lib/date-format'
import { getSalesBillDefaultFunction } from '@/types/sales-bill/sales-bill'

type Props = {
    searchParams: Promise<{
        limit?: string
        page?: string
    }>
}

export default async function SalesListPage(props: Props) {
    const searchParams = await props.searchParams;

    const {
        limit = '10',
        page = '1'
    } = searchParams;

    const salesBills = await prisma.document.findMany({
        where: {
            type: 'SalesBill',
        },
        include: {
            SalesBill: {
                include: {
                    Contact: true,
                    Sales: {
                        include: {
                            GeneralLedger: {
                                include: {
                                    ChartOfAccount: true,
                                },
                            },
                        },
                    },
                    SalesReturn: {
                        include: {
                            GeneralLedger: {
                                include: {
                                    ChartOfAccount: true,
                                },
                            },
                        },
                    },
                    SalesReceived: true,
                },
            },
        },
        orderBy: [{ date: 'desc' }, { documentNo: 'desc' }],
        take: +limit,
        skip: (Number(page) - 1) * Number(limit),
    })

    const documentCount = await prisma.document.count({
        where: {
            type: 'SalesBill',
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
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {salesBills.map((bill, index) => (
                        <TableRow
                            key={bill.documentNo}
                            className={cn(
                                index % 2 === 0 && 'bg-muted-100',
                                'border-b'
                            )}
                        >
                            <TableCell className="w-[150px]">
                                {fullDateFormat(bill.date)}
                            </TableCell>
                            <TableCell className="w-[100px]">
                                {bill.documentNo}
                            </TableCell>
                            <TableCell>
                                {bill.SalesBill?.Contact.name}
                            </TableCell>
                            <TableCell>
                                {bill.SalesBill?.salesReceivedId ? (
                                    <Badge className="bg-green-500">
                                        จ่ายแล้ว
                                    </Badge>
                                ) : (
                                    <Badge variant={'destructive'}>
                                        ยังไม่จ่าย
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {[
                                    ...(bill.SalesBill?.Sales || []),
                                    ...(bill.SalesBill?.SalesReturn || []),
                                ]
                                    .reduce(
                                        (a, b) =>
                                            a +
                                            b.GeneralLedger.reduce(
                                                (a, b) =>
                                                    b.ChartOfAccount.isAr
                                                        ? a + b.amount
                                                        : a,
                                                0
                                            ),
                                        0
                                    )
                                    .toLocaleString()}
                            </TableCell>
                            <TableCell>
                                <Link
                                    href={`/sales/sales-bill/${bill.documentNo}`}
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
