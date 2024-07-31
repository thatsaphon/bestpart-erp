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
import { format } from 'date-fns'
import { Avatar } from '@/components/ui/avatar'
import prisma from '@/app/db/db'

type Props = {
    searchParams: {
        limit?: string
        page?: string
        from?: string
        to?: string
    }
}

export default async function SalesListPage({
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
    const sales = await prisma.document.findMany({
        where: {
            documentNo: {
                startsWith: 'CN',
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
            ArSubledger: {
                select: {
                    Contact: true,
                    paymentStatus: true,
                },
            },
            GeneralLedger: {
                where: {
                    chartOfAccountId: {
                        gte: 11000,
                        lte: 12000,
                    },
                },
            },
        },
        orderBy: [{ date: 'desc' }, { documentNo: 'desc' }],
        take: +limit,
        skip: (Number(page) - 1) * Number(limit),
    })

    const documentCount = await prisma.document.count({
        where: {
            documentNo: {
                startsWith: 'CN',
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
    const documentSum = await prisma.$queryRaw<
        { sum: number }[]
    >`select COALESCE(sum("GeneralLedger"."amount"), 0) as "sum" from "GeneralLedger"
             left join "_DocumentToGeneralLedger" on "_DocumentToGeneralLedger"."B" = "GeneralLedger"."id"
             left join "Document" on "_DocumentToGeneralLedger"."A" = "Document"."id"
             where "chartOfAccountId" in (11000, 12000) and "Document"."documentNo" like 'CN%' and 
             "Document"."date" between ${new Date(from)} and ${new Date(new Date(to).setDate(new Date(to).getDate() + 1))}::date and
             "Document"."documentNo" like 'CN%'`

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
                    {sales.map((sale) => (
                        <TableRow key={sale.documentNo}>
                            <TableCell>
                                {new Intl.DateTimeFormat('th-TH', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    timeZone: 'Asia/Bangkok', // Set time zone to Bangkok
                                    localeMatcher: 'best fit',
                                }).format(sale.date)}
                            </TableCell>
                            <TableCell>{sale.documentNo}</TableCell>
                            <TableCell>
                                {sale.ArSubledger?.Contact.name || '-'}
                            </TableCell>
                            <TableCell>{sale.createdBy}</TableCell>
                            <TableCell className="text-center">
                                {sale.ArSubledger?.paymentStatus === 'Paid' ? (
                                    <Badge className="bg-green-400">
                                        จ่ายแล้ว
                                    </Badge>
                                ) : sale.ArSubledger?.paymentStatus ===
                                  'Billed' ? (
                                    <Badge variant={`secondary`}>
                                        วางบิลแล้ว
                                    </Badge>
                                ) : sale.ArSubledger?.paymentStatus ===
                                  'PartialPaid' ? (
                                    <Badge variant={'destructive'}>
                                        จ่ายบางส่วน
                                    </Badge>
                                ) : !sale.ArSubledger ? (
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
                                {sale.GeneralLedger.reduce(
                                    (acc, gl) => acc + gl.amount,
                                    0
                                ).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link href={`/sales/return/${sale.documentNo}`}>
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
                                    {sales
                                        .reduce(
                                            (total, sale) =>
                                                total +
                                                sale.GeneralLedger[0]?.amount,
                                            0
                                        )
                                        .toLocaleString()}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>รวมทุกหน้า</TableCell>
                                <TableCell>{documentCount}</TableCell>
                                <TableCell>
                                    {documentSum[0].sum.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    )
}
