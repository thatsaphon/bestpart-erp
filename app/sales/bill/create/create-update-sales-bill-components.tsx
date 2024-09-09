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
import { createSalesBill } from './create-sales-bill'
import toast from 'react-hot-toast'
import { getSalesBill } from '@/types/sales-bill/sales-bill'
import { deleteSalesBill } from './delete-sales-bill'
import { useRouter } from 'next/navigation'
import { updateSalesBill } from './update-sales-bill'

type Props = {
    existingSalesBill?: getSalesBill
    existingSalesBillItems?: SalesBillItem[]
    unpaidItems: SalesBillItem[]
}

export default function CreateUpdateSalesBillComponents({
    existingSalesBill,
    existingSalesBillItems = [],
    unpaidItems,
}: Props) {
    const router = useRouter()
    const [documentDetail, setDocumentDetail] = useState<DocumentDetail>(
        existingSalesBill
            ? {
                  ...existingSalesBill,
                  contactId: existingSalesBill?.SalesBill?.contactId,
              }
            : getDefaultDocumentDetail()
    )
    const [open, setOpen] = useState(false)
    const [selectedItems, setSelectedItems] = useState<SalesBillItem[]>(
        existingSalesBillItems
    )

    const onCreateSalesBill = async () => {
        try {
            const result = await createSalesBill(documentDetail, selectedItems)
            toast.success('บันทึกสําเร็จ')
        } catch (err) {
            if (err instanceof Error) return toast.error(err.message)
            toast.error('Something went wrong')
        }
    }

    const onUpdateSalesBill = async () => {
        try {
            if (!existingSalesBill) {
                toast.error('ไม่พบใบวางบิลที่ต้องการแก้ไข')
                return
            }
            const result = await updateSalesBill(
                existingSalesBill?.id,
                documentDetail,
                selectedItems
            )
            toast.success('บันทึกสําเร็จ')
        } catch (err) {
            if (err instanceof Error) return toast.error(err.message)
            toast.error('Something went wrong')
        }
    }

    const onDeleteSalesBill = async () => {
        try {
            if (!existingSalesBill) {
                toast.error('ไม่พบใบวางบิลที่ต้องการลบ')
                return
            }

            const result = await deleteSalesBill(existingSalesBill.documentNo)
            toast.success('ลบสําเร็จ')
        } catch (err) {
            if (err instanceof Error) return toast.error(err.message)
            toast.error('Something went wrong')
        }
    }

    return (
        <div className="p-3" key={documentDetail.contactId}>
            <div className="flex items-baseline gap-3">
                <DocumentDetailForm
                    documentDetail={documentDetail}
                    setDocumentDetail={setDocumentDetail}
                    useSearchParams
                    disabled={existingSalesBill ? true : false}
                />
                {existingSalesBill && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button type="button" variant={'destructive'}>
                                ลบใบวางบิล
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="min-w-[800px]">
                            <DialogTitle className="w-full">
                                เลือกรายการขาย
                            </DialogTitle>
                            <p>คุณยืนยันที่จะลบใบวางบิลหรือไม่</p>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button
                                        variant="destructive"
                                        onClick={onDeleteSalesBill}
                                    >
                                        ยืนยัน
                                    </Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button type="button" variant="ghost">
                                        ยกเลิก
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="m-3"
                        disabled={!documentDetail.contactId}
                    >
                        เลือกใบรายการขาย
                    </Button>
                </DialogTrigger>

                {/* <DialogOverlay /> */}

                <DialogContent className="min-w-[800px]">
                    <DialogTitle className="w-full">เลือกรายการขาย</DialogTitle>
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
                            {(unpaidItems.length === 0 ||
                                !existingSalesBill) && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center"
                                    >
                                        ไม่พบรายการขายของลูกค้า
                                    </TableCell>
                                </TableRow>
                            )}
                            {[...existingSalesBillItems, ...unpaidItems].map(
                                (item, index) => (
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
                                                                  (i) =>
                                                                      i !== item
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
                                )
                            )}
                        </TableBody>
                    </Table>
                    <DialogFooter>
                        <Button
                            variant="outline"
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
                    {selectedItems.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center">
                                กรุณาเลือกรายการขาย
                            </TableCell>
                        </TableRow>
                    )}
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
                <TableFooter>
                    <TableRow>
                        <TableHead className="text-right" colSpan={4}>
                            Total
                        </TableHead>
                        <TableHead className="text-right">
                            {selectedItems
                                .reduce((total, item) => total + item.amount, 0)
                                .toLocaleString()}
                        </TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                    <TableRow>
                        <TableHead colSpan={5}>
                            <div className="flex justify-end gap-2">
                                {existingSalesBill ? (
                                    <Button
                                        disabled={selectedItems.length === 0}
                                        onClick={onUpdateSalesBill}
                                    >
                                        แก้ไขใบวางบิล
                                    </Button>
                                ) : (
                                    <Button
                                        disabled={selectedItems.length === 0}
                                        onClick={onCreateSalesBill}
                                    >
                                        สร้างใบวางบิล
                                    </Button>
                                )}
                                <Button variant={'destructive'}>รีเซ็ต</Button>
                            </div>
                        </TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}
