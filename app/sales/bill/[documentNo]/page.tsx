import prisma from '@/app/db/db'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import ReceivedDialog from './received-dialog'
import BillInvoiceLinkComponent from './bill-invoice-link-component'
import { Metadata, ResolvingMetadata } from 'next'

type Props = {
    params: {
        documentNo: string
    }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    return {
        title: `รายละเอียดใบวางบิล - ${params.documentNo}`,
    }
}

export default async function page({ params: { documentNo } }: Props) {
    const billingNote = await prisma.document.findMany({
        where: {
            documentNo,
        },
        include: {
            ArSubledger: true,
            GeneralLedger: {
                where: {
                    chartOfAccountId: 12000,
                },
                include: {
                    Document: {
                        where: {
                            OR: [{ type: 'Sales' }, { type: 'Received' }],
                        },
                    },
                },
            },
        },
    })

    const salesInvoices = billingNote[0].GeneralLedger

    const bankAccounts = await prisma.chartOfAccount.findMany({
        where: {
            AND: [{ id: { gte: 11000 } }, { id: { lte: 11299 } }],
        },
    })

    return (
        <div className="p-3">
            <div>
                <div>
                    {/* <div className="flex gap-2"></div> */}
                    <div className="flex items-center gap-2 text-xl font-bold">
                        <h1>ใบวางบิล</h1>
                        <Badge
                            variant={
                                billingNote[0].ArSubledger?.paymentStatus ===
                                'Paid'
                                    ? 'outline'
                                    : 'destructive'
                            }
                        >
                            {billingNote[0].ArSubledger?.paymentStatus ===
                            'Paid'
                                ? 'จ่ายแล้ว'
                                : billingNote[0].ArSubledger?.paymentStatus ===
                                    'PartialPaid'
                                  ? 'จ่ายบางส่วน'
                                  : 'ยังไม่จ่าย'}
                        </Badge>
                    </div>
                    <p>เลขที่: {billingNote[0].documentNo}</p>
                    <p>ชื่อ: {billingNote[0].contactName}</p>
                    <p>ที่อยู่: {billingNote[0].address}</p>
                    <p>โทร: {billingNote[0].phone}</p>
                    <p>เลขประจำตัวผู้เสียภาษี: {billingNote[0].taxId}</p>
                </div>
                <BillInvoiceLinkComponent document={billingNote[0]} />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>วันที่</TableHead>
                        <TableHead>เลขที่</TableHead>
                        <TableHead>จำนวนเงิน</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {salesInvoices
                        .sort((a, b) => a.Document[0].id - b.Document[0].id)
                        .map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {Intl.DateTimeFormat('th-TH', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        timeZone: 'Asia/Bangkok', // Set time zone to Bangkok
                                        localeMatcher: 'best fit',
                                    }).format(new Date(item.Document[0].date))}
                                </TableCell>
                                <TableCell>
                                    {item.Document[0].documentNo}
                                </TableCell>
                                <TableCell>{item.amount}</TableCell>
                            </TableRow>
                        ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={2}>รวม</TableCell>
                        <TableCell>
                            {salesInvoices.reduce((a, b) => a + b.amount, 0)}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>

            <div className="mt-4">
                <ReceivedDialog
                    bankAccounts={bankAccounts}
                    billAmount={salesInvoices.reduce((a, b) => a + b.amount, 0)}
                    documentNo={documentNo}
                />
            </div>
        </div>
    )
}
