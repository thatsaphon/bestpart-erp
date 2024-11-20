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
import PaginationComponent from '@/components/pagination-component'
import { ViewIcon } from 'lucide-react'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import { Prisma } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import {
    endOfDay,
    endOfMonth,
    format,
    getMonth,
    getYear,
    startOfMonth,
} from 'date-fns'
import { Avatar } from '@/components/ui/avatar'
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

export default async function SalesListPage(props: Props) {
    const searchParams = await props.searchParams;

    const {
        limit = '10',
        page = '1',
        from = format(getLastMonth(), 'yyyy-MM-dd'),
        to = format(endOfMonth(new Date()), 'yyyy-MM-dd')
    } = searchParams;

    const documents = await prisma.document.findMany({
        where: {
            type: 'SalesReturn',
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
            SalesReturn: {
                include: {
                    Contact: true,
                    SalesReturnItem: true,
                    GeneralLedger: { include: { ChartOfAccount: true } },
                    SalesBill: true,
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
            type: 'SalesReturn',
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

    const documentSum = await prisma.$queryRaw<
        { sum: number | null }[]
    >`select sum("SalesReturnItem"."quantity" * "SalesReturnItem"."pricePerUnit") from "Document"
        left join "SalesReturn" on "Document"."id" = "SalesReturn"."documentId"
        left join "SalesReturnItem" on "SalesReturn"."id" = "SalesReturnItem"."salesReturnId"
        where 
        "Document"."date" between ${new Date(from)} and ${new Date(new Date(to).setDate(new Date(to).getDate() + 1))}::date and
        "Document"."type" = 'SalesReturn'
`

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
                        <TableHead>สร้างโดย</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.map((sale) => (
                        <TableRow key={sale.documentNo}>
                            <TableCell>{fullDateFormat(sale.date)}</TableCell>
                            <TableCell>{sale.documentNo}</TableCell>
                            <TableCell>
                                {sale.SalesReturn?.Contact?.name || '-'}
                            </TableCell>
                            <TableCell>{sale.createdBy}</TableCell>
                            <TableCell className="text-center">
                                {sale.SalesReturn?.salesReceivedId != null ? (
                                    <Badge className="bg-green-400">
                                        จ่ายแล้ว
                                    </Badge>
                                ) : sale.SalesReturn?.salesBillId != null ? (
                                    <Badge variant={`secondary`}>
                                        วางบิลแล้ว
                                    </Badge>
                                ) : !sale.SalesReturn?.GeneralLedger.find(
                                      ({ ChartOfAccount }) =>
                                          ChartOfAccount.isAr
                                  )?.amount ? (
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
                                {sale.SalesReturn?.SalesReturnItem.reduce(
                                    (acc, item) =>
                                        acc + item.pricePerUnit * item.quantity,
                                    0
                                ).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link
                                    href={`/sales/sales-return/${sale.documentNo}`}
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

            <div className="flex w-full justify-end px-4">
                <div className="w-[400px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead></TableHead>
                                <TableHead>จำนวนบิล</TableHead>
                                <TableHead>ยอดรวม</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>หน้านี้</TableCell>
                                <TableCell>
                                    {documentCount > +limit
                                        ? limit
                                        : documentCount}
                                </TableCell>
                                <TableCell>
                                    {/* {sales
                                        .reduce(
                                            (total, sale) =>
                                                total +
                                                sale.SalesReturn?.GeneralLedger,
                                            0
                                        )
                                        .toLocaleString()} */}
                                    {documents.reduce(
                                        (total, sale) =>
                                            sale.SalesReturn?.SalesReturnItem.reduce(
                                                (total, item) =>
                                                    total +
                                                    item.quantity *
                                                        item.pricePerUnit,
                                                0
                                            ) || 0,
                                        0
                                    )}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>รวมทุกหน้า</TableCell>
                                <TableCell>{documentCount}</TableCell>
                                <TableCell>
                                    {(documentSum[0].sum || 0).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    )
}
