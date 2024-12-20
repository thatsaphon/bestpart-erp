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
import { EyeOpenIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { fullDateFormat } from '@/lib/date-format'

type Props = {
    searchParams: Promise<{
        limit?: string
        page?: string
    }>
}

export default async function SalesReceivedListPage(props: Props) {
    const searchParams = await props.searchParams;

    const {
        limit = '10',
        page = '1'
    } = searchParams;

    const salesReceiveds = await prisma.document.findMany({
        where: {
            type: 'SalesReceived',
        },
        include: {
            SalesReceived: {
                include: {
                    Contact: true,
                    GeneralLedger: {
                        include: {
                            ChartOfAccount: true,
                        },
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
            type: 'SalesReceived',
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
                    {salesReceiveds.map((received, index) => (
                        <TableRow
                            key={received.documentNo}
                            className={cn(
                                index % 2 === 0 && 'bg-muted-100',
                                'border-b'
                            )}
                        >
                            <TableCell className="w-[150px]">
                                {fullDateFormat(received.date)}
                            </TableCell>
                            <TableCell className="w-[100px]">
                                {received.documentNo}
                            </TableCell>
                            <TableCell>
                                {received.SalesReceived?.Contact.name}
                            </TableCell>
                            <TableCell className="text-right">
                                {received.SalesReceived?.GeneralLedger.reduce(
                                    (
                                        a,
                                        {
                                            amount,
                                            ChartOfAccount: {
                                                isCash,
                                                isDeposit,
                                            },
                                        }
                                    ) => (isCash || isDeposit ? a + amount : a),
                                    0
                                ).toLocaleString()}
                            </TableCell>
                            <TableCell>
                                <Link
                                    href={`/sales/sales-received/${received.documentNo}`}
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
