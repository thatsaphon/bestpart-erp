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
import prisma from '../db/db'
import PaginationComponent from '@/components/pagination-component'
import { ViewIcon } from 'lucide-react'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import { Prisma } from '@prisma/client'

type Props = {
    searchParams: {
        limit?: string
        page?: string
    }
}

export default async function SalesListPage({
    searchParams: { limit = '10', page = '1' },
}: Props) {
    const sales = await prisma.document.findMany({
        where: {
            documentId: {
                startsWith: 'SINV',
            },
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
                        in: [11000, 12000],
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
                startsWith: 'SINV',
            },
        }
    })
    const numberOfPage = Math.ceil(documentCount / Number(limit))

    return (
        <div className="mb-2 p-3">
            <h1 className="flex items-center gap-2 text-3xl text-primary">
                <span>งานขายสินค้า</span>
                <Link href={'/sales/create'}>
                    <Button className="ml-3" variant={'outline'}>
                        สร้างบิลขาย
                    </Button>
                </Link>
            </h1>
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
                    {sales.map((sale) => (
                        <TableRow key={sale.documentId}>
                            <TableCell>
                                {/* {format(sale.date, 'dd/MM/yyyy')} */}
                                {new Intl.DateTimeFormat('th-TH', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    timeZone: 'Asia/Bangkok', // Set time zone to Bangkok
                                    localeMatcher: 'best fit',
                                }).format(sale.date)}
                            </TableCell>
                            <TableCell>{sale.documentId}</TableCell>
                            <TableCell>
                                {sale.ArSubledger?.Contact.name || 'เงินสด'}
                            </TableCell>
                            <TableCell>
                                {sale.ArSubledger?.paymentStatus || 'Paid'}
                            </TableCell>
                            <TableCell className="text-right">
                                {sale.GeneralLedger[0]?.amount}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link href={`/sales/${sale.documentId}`}>
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
        </div>
    )
}
