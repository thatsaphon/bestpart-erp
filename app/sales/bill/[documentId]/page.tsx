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
import React from 'react'

type Props = {
    params: {
        documentId: string
    }
}

export default async function page({ params: { documentId } }: Props) {
    const billingNote = await prisma.document.findMany({
        where: {
            documentId,
        },
        include: {
            ArSubledger: true,
            GeneralLedger: {
                include: {
                    Document: {
                        where: {
                            type: 'Sales',
                        },
                    },
                },
            },
        },
    })

    // const billingNote =
    //     await prisma.$queryRaw`select "Document".*, "GeneralLdeger".* from "Document"
    //     left join "_DocumentToGeneralLedger" on "_DocumentToGeneralLedger"."A" = "Document"."id"
    //     left join "GeneralLedger" on "GeneralLedger"."id" = "_DocumentToGeneralLedger"."B"
    //     left join "Document" as "SalesInvoice" on "SalesInvoice"."id" = "_DocumentToGeneralLedger"."A"
    //     where "Document"."documentId" = ${documentId}
    //     `

    // console.log(billingNote[0].GeneralLedger.map((item) => item.Document))
    const salesInvoices = billingNote[0].GeneralLedger

    return (
        <div className="p-3">
            <div>
                {/* <div className="flex gap-2"></div> */}
                <div className="flex items-center gap-2 text-xl font-bold">
                    <h1>ใบวางบิล</h1>

                    <Badge
                        variant={
                            billingNote[0].ArSubledger?.paymentStatus === 'Paid'
                                ? 'outline'
                                : 'destructive'
                        }
                    >
                        {billingNote[0].ArSubledger?.paymentStatus === 'Paid'
                            ? 'จ่ายแล้ว'
                            : 'ยังไม่จ่าย'}
                    </Badge>
                </div>
                <p>เลขที่: {billingNote[0].documentId}</p>
                <p>ชื่อ: {billingNote[0].contactName}</p>
                <p>ที่อยู่: {billingNote[0].address}</p>
                <p>โทร: {billingNote[0].phone}</p>
                <p>เลขประจำตัวผู้เสียภาษี: {billingNote[0].taxId}</p>
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
                    {salesInvoices.map((item) => (
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
                            <TableCell>{item.Document[0].documentId}</TableCell>
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
        </div>
    )
}
