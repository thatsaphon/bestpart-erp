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

type Props = {
    searchParams: {
        limit?: string
        page?: string
    }
}

export default async function SalesListPage({
    searchParams: { limit = '10', page = '1' },
}: Props) {
    const billingNotes = await prisma.document.findMany({
        where: {
            type: 'BillingNote',
        },
        include: {
            ArSubledger: {
                select: {
                    Contact: true,
                    paymentStatus: true,
                },
            },
            GeneralLedger: {
                where: {
                    AND: [
                        {
                            chartOfAccountId: {
                                gte: 11000,
                            },
                        },
                        {
                            chartOfAccountId: {
                                lte: 12000,
                            },
                        },
                    ],
                },
                include: { ChartOfAccount: true, Document: true },
            },
        },
        orderBy: [{ date: 'desc' }, { documentNo: 'desc' }],
        take: +limit,
        skip: (Number(page) - 1) * Number(limit),
    })

    const documentCount = await prisma.document.count({
        where: {
            type: 'BillingNote',
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
                    {billingNotes.map((bill) => (
                        <TableRow key={bill.documentNo}>
                            <TableCell>
                                {/* {format(sale.date, 'dd/MM/yyyy')} */}
                                {fullDateFormat(bill.date)}
                            </TableCell>
                            <TableCell>{bill.documentNo}</TableCell>
                            <TableCell>
                                {bill.ArSubledger?.Contact.name || 'เงินสด'}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        bill.ArSubledger?.paymentStatus ===
                                        'Paid'
                                            ? 'default'
                                            : 'destructive'
                                    }
                                    className={cn(
                                        bill.ArSubledger?.paymentStatus ===
                                            'Paid' && 'bg-green-400'
                                    )}
                                >
                                    {bill.ArSubledger?.paymentStatus ===
                                    'NotPaid'
                                        ? 'ยังไม่จ่าย'
                                        : bill.ArSubledger?.paymentStatus ===
                                            'PartialPaid'
                                          ? 'จ่ายบางส่วน'
                                          : 'จ่ายแล้ว'}
                                </Badge>
                            </TableCell>
                            <TableCell
                                className={cn(
                                    'text-right',
                                    bill.GeneralLedger.find(
                                        (item) => item.amount < 0
                                    ) && 'text-destructive',
                                    bill.GeneralLedger.reduce(
                                        (total, item) =>
                                            item.chartOfAccountId === 12000
                                                ? total + item.amount
                                                : total,
                                        0
                                    ) === 0 && 'text-green-500'
                                )}
                            >
                                {bill.GeneralLedger.find(
                                    (item) => item.amount < 0
                                ) ? (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                {bill.GeneralLedger.filter(
                                                    (gl) =>
                                                        gl.amount > 0 &&
                                                        gl.chartOfAccountId ===
                                                            12000
                                                ).reduce(
                                                    (total, item) =>
                                                        total + item.amount,
                                                    0
                                                )}
                                            </TooltipTrigger>
                                            <TooltipContent className="p-2">
                                                <div className="grid grid-cols-[auto_auto_auto_auto] gap-x-2 text-left">
                                                    {bill.GeneralLedger.filter(
                                                        (gl) =>
                                                            gl.chartOfAccountId !==
                                                            12000
                                                    ).map((item) => (
                                                        <Fragment key={item.id}>
                                                            <p>
                                                                {Intl.DateTimeFormat(
                                                                    'th-TH',
                                                                    {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        timeZone:
                                                                            'Asia/Bangkok', // Set time zone to Bangkok
                                                                        localeMatcher:
                                                                            'best fit',
                                                                    }
                                                                ).format(
                                                                    item.Document.find(
                                                                        (
                                                                            document
                                                                        ) =>
                                                                            document.type ===
                                                                                'Sales' ||
                                                                            document.type ===
                                                                                'Received'
                                                                    )?.date
                                                                )}
                                                            </p>
                                                            <p>รับชำระ</p>
                                                            <p className="text-center">
                                                                {
                                                                    item
                                                                        .ChartOfAccount
                                                                        .name
                                                                }
                                                            </p>
                                                            <p>{item.amount}</p>
                                                        </Fragment>
                                                    ))}
                                                    <Fragment key={'remaining'}>
                                                        <p></p>
                                                        <p></p>
                                                        <p className="text-right">
                                                            คงเหลือ
                                                        </p>
                                                        <p>
                                                            {bill.GeneralLedger.reduce(
                                                                (
                                                                    total,
                                                                    item
                                                                ) =>
                                                                    item.chartOfAccountId ===
                                                                    12000
                                                                        ? total +
                                                                          item.amount
                                                                        : total,
                                                                0
                                                            )}
                                                        </p>
                                                    </Fragment>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : (
                                    <>
                                        {bill.GeneralLedger.filter(
                                            (gl) => gl.amount > 0
                                        ).reduce(
                                            (total, item) =>
                                                total + item.amount,
                                            0
                                        )}
                                    </>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link href={`/sales/bill/${bill.documentNo}`}>
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
