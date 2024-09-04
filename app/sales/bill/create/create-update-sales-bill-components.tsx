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
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        Create Sales Bill
                    </Button>
                </DialogTrigger>

                <DialogOverlay />

                <DialogContent>
                    <DialogTitle>Create Sales Bill</DialogTitle>

                    <DialogContent>
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="w-12">No</th>
                                    <th className="w-24">Document No</th>
                                    <th className="w-24">Document Date</th>
                                    <th className="w-24">Due Date</th>
                                    <th className="w-24">Customer</th>
                                    <th className="w-24">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unpaidItems.map((item, i) => (
                                    <tr key={i}>
                                        <td className="text-center">{i + 1}</td>
                                        <td>{item.documentNo}</td>
                                        <td>{item.type}</td>
                                        <td>{item.type}</td>
                                        <td>{item.type}</td>
                                        <td className="text-right">
                                            {item.amount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </DialogContent>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
