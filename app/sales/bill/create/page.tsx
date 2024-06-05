'use client'

import SelectSearchCustomer from '@/components/select-search-customer'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHeader,
    TableRow,
    TableHead,
} from '@/components/ui/table'
import React, { useState } from 'react'
import SearchDocumentDialogComponent from './search-document-dialog'
import { fetchUnpaidSalesInvoice } from './fetch-unpaid-sales-invoice'

type Props = {}

export default function CreateBillPage({}: Props) {
    const [selectedDocuments, setSelectedDocuments] = useState<
        Awaited<ReturnType<typeof fetchUnpaidSalesInvoice>>
    >([])
    return (
        <form className="p-3">
            <div className="flex items-baseline gap-2">
                <span>ลูกค้า</span>
                <SelectSearchCustomer hasTextArea />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ที่</TableHead>
                        <TableHead>วันที่</TableHead>
                        <TableHead>เลขที่</TableHead>
                        <TableHead>จำนวนเงิน</TableHead>
                    </TableRow>
                </TableHeader>
                {selectedDocuments
                    .sort((a, b) => a.id - b.id)
                    .map((document, index) => (
                        <TableBody key={document.id}>
                            <TableRow>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    {Intl.DateTimeFormat('th-TH', {
                                        timeZone: 'Asia/Bangkok',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    }).format(document.date)}
                                </TableCell>
                                <TableCell>{document.documentId}</TableCell>
                                <TableCell>
                                    {document.GeneralLedger[0].amount}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    ))}
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <SearchDocumentDialogComponent
                                selectedDocuments={selectedDocuments}
                                setSelectedDocuments={setSelectedDocuments}
                            />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </form>
    )
}
