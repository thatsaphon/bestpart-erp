'use client'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import React, { useEffect, useRef, useState } from 'react'
import { fetchUnpaidSalesInvoice } from './fetch-unpaid-sales-invoice'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHeader,
    TableRow,
    TableHead,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'

type Props = {
    selectedDocuments: Awaited<ReturnType<typeof fetchUnpaidSalesInvoice>>
    setSelectedDocuments: (
        selectedDocuments: Awaited<ReturnType<typeof fetchUnpaidSalesInvoice>>
    ) => void
}

export default function SearchDocumentDialogComponent({
    selectedDocuments,
    setSelectedDocuments,
}: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchResult, setSearchResult] = useState<
        Awaited<ReturnType<typeof fetchUnpaidSalesInvoice>>
    >([])

    // const [selectedDocuments, setSelectedDocuments] = useState<
    //     Awaited<ReturnType<typeof fetchUnpaidSalesInvoice>>
    // >([])

    return (
        <div>
            <Dialog
                open={isOpen}
                onOpenChange={(bool) => {
                    setIsOpen(bool)
                }}
            >
                <Input
                    onKeyDown={async (e) => {
                        if (e.shiftKey && e.code === 'Slash') {
                            e.preventDefault()
                            setIsOpen(true)
                            const form = e.currentTarget.form as HTMLFormElement
                            const customerId = new FormData(form).get(
                                'customerId'
                            ) as string
                            const result = await fetchUnpaidSalesInvoice(
                                Number(customerId)
                            )
                            setSearchResult(result)
                        }
                    }}
                />
                <DialogContent className="w-[600px]">
                    <DialogHeader>
                        <DialogTitle>รายการที่ยังไม่ได้วางบิล</DialogTitle>
                    </DialogHeader>
                    <Table className="w-full">
                        <TableHeader className="w-full">
                            <TableRow>
                                <TableHead>
                                    <Checkbox />
                                </TableHead>
                                <TableHead>ที่</TableHead>
                                <TableHead>วันที่</TableHead>
                                <TableHead>เลขที่</TableHead>
                                <TableHead>จำนวนเงิน</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {searchResult.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedDocuments.includes(
                                                item
                                            )}
                                            onCheckedChange={(e) => {
                                                if (e) {
                                                    setSelectedDocuments([
                                                        ...selectedDocuments,
                                                        item,
                                                    ])
                                                } else {
                                                    setSelectedDocuments(
                                                        selectedDocuments.filter(
                                                            (doc) =>
                                                                doc !== item
                                                        )
                                                    )
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        {new Intl.DateTimeFormat('th-TH', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            timeZone: 'Asia/Bangkok', // Set time zone to Bangkok
                                            localeMatcher: 'best fit',
                                        }).format(item.date)}
                                    </TableCell>
                                    <TableCell>{item.documentId}</TableCell>
                                    <TableCell>
                                        {item.GeneralLedger[0].amount}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsOpen(false)
                            }}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
