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
import { Button } from '@/components/ui/button'
import { createBillingNote } from '@/app/contact/[id]/receivable/create-billing-note'
import toast from 'react-hot-toast'
import { DatePickerWithPresets } from '@/components/date-picker-preset'
import { Metadata } from 'next'

type Props = {}

// export const metadata: Metadata = {
//     title: 'สร้างใบวางบิล',
// }

export default function CreateBillPage({}: Props) {
    const [selectedDocuments, setSelectedDocuments] = useState<
        Awaited<ReturnType<typeof fetchUnpaidSalesInvoice>>
    >([])

    const ref = React.createRef<HTMLFormElement>()
    return (
        <form
            ref={ref}
            className="p-3"
            action={async (formData) => {
                try {
                    await createBillingNote(
                        formData,
                        selectedDocuments.map((document) => document.documentNo)
                    )
                    toast.success('Create billing note success')
                    ref.current?.reset()

                    setSelectedDocuments([])
                } catch (err) {
                    if (err instanceof Error) toast.error(err.message)
                    toast.error('Something went wrong')
                }
            }}
        >
            <div className="flex items-baseline gap-2">
                <span>วันที่</span>
                <DatePickerWithPresets />
                <span>เลขที่เอกสาร</span>
                <Input name="documentNo" className="w-auto" />
                {/* <SelectSearchCustomer hasTextArea /> */}
            </div>
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
                                <TableCell>{document.documentNo}</TableCell>
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
            <div className="flex justify-end pr-[25%]">
                <Button>บันทึก</Button>
            </div>
        </form>
    )
}
