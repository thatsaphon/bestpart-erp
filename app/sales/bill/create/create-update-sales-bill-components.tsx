'use client'

import { DocumentDetailForm } from '@/components/document-detail-form'
import SelectSearchContactSearchParams from '@/components/select-search-contact-search-params'
import {
    DocumentDetail,
    getDefaultDocumentDetail,
} from '@/types/document-detail'
import { SalesBillItem } from '@/types/sales-bill/sales-bill-item'
import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { fullDateFormat } from '@/lib/date-format'

type Props = {
    unpaidItems: SalesBillItem[]
}

export default function CreateUpdateSalesBillComponents({
    unpaidItems,
}: Props) {
    const [documentDetail, setDocumentDetail] = useState<DocumentDetail>(
        getDefaultDocumentDetail()
    )
    const [open, setOpen] = useState(false)
    const [selectedItems, setSelectedItems] = useState<SalesBillItem[]>([])

    useEffect(() => {
        if (documentDetail && documentDetail.contactId) {
            setOpen(true)
        }
    }, [documentDetail, documentDetail.contactId])

    return (
        <div className="p-3">
            <DocumentDetailForm
                documentDetail={documentDetail}
                setDocumentDetail={setDocumentDetail}
                useSearchParams
            />
            <Dialog
                open={open}
                onOpenChange={setOpen}
                // key={documentDetail.contactId}
            >
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        Create Sales Bill
                    </Button>
                </DialogTrigger>

                {/* <DialogOverlay /> */}

                <DialogContent className="min-w-[800px]">
                    <DialogTitle className="w-full">
                        Create Sales Bill
                    </DialogTitle>
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">
                                    No
                                </TableHead>
                                <TableHead>Document No</TableHead>
                                <TableHead>type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {unpaidItems.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="text-center">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell>{item.documentNo}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>
                                        {fullDateFormat(item.date)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            className="w-24"
                                            variant={
                                                selectedItems.find(
                                                    (selectedItem) =>
                                                        selectedItem.documentId ===
                                                        item.documentId
                                                )
                                                    ? 'destructive'
                                                    : 'default'
                                            }
                                            onClick={() =>
                                                selectedItems.find(
                                                    (selectedItem) =>
                                                        selectedItem.documentId ===
                                                        item.documentId
                                                )
                                                    ? setSelectedItems(
                                                          selectedItems.filter(
                                                              (i) => i !== item
                                                          )
                                                      )
                                                    : setSelectedItems([
                                                          ...selectedItems,
                                                          item,
                                                      ])
                                            }
                                        >
                                            {selectedItems.find(
                                                (selectedItem) =>
                                                    selectedItem.documentId ===
                                                    item.documentId
                                            )
                                                ? 'Remove'
                                                : 'Add'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            // className="w-full"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Document No</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {selectedItems.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell className="text-center">
                                {index + 1}
                            </TableCell>
                            <TableCell>{item.documentNo}</TableCell>
                            <TableCell>{item.type}</TableCell>
                            <TableCell>{fullDateFormat(item.date)}</TableCell>
                            <TableCell className="text-right">
                                {item.amount.toLocaleString()}
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
