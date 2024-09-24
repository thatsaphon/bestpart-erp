'use client'

import { DocumentDetailForm } from '@/components/document-detail-form'
import SelectSearchContactSearchParams from '@/components/select-search-contact-search-params'
import {
    DocumentDetail,
    getDefaultDocumentDetail,
} from '@/types/document-detail'
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
import { createSalesReceived } from './create-sales-received'
import toast from 'react-hot-toast'
import { getSalesBill } from '@/types/sales-bill/sales-bill'
import { deleteSalesReceived } from './delete-sales-received'
import { useRouter } from 'next/navigation'
import { updateSalesReceived } from './update-sales-received'
import { getSalesReceived } from '@/types/sales-received/sales-receive'
import { SalesReceivedItem } from '@/types/sales-received/sales-receive-item'
import { generalLedgerToPayments, Payment } from '@/types/payment/payment'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import AddPaymentComponent from '@/components/add-payment-component'
import { GetDocumentRemark } from '@/types/remark/document-remark'
import CreateDocumentRemark from '@/components/create-document-remark'

type Props = {
    existingSalesReceived?: getSalesReceived
    existingSalesReceivedItems?: SalesReceivedItem[]
    unpaidItems: SalesReceivedItem[]
    paymentMethods: Awaited<ReturnType<typeof getPaymentMethods>>
    depositAmount: number
}

export default function CreateUpdateSalesReceivedComponents({
    existingSalesReceived,
    existingSalesReceivedItems = [],
    unpaidItems,
    paymentMethods,
    depositAmount,
}: Props) {
    const [documentDetail, setDocumentDetail] = useState<DocumentDetail>(
        existingSalesReceived
            ? {
                  ...existingSalesReceived,
                  contactId: existingSalesReceived?.SalesReceived?.contactId,
              }
            : getDefaultDocumentDetail()
    )
    const [open, setOpen] = useState(false)
    const [selectedItems, setSelectedItems] = useState<SalesReceivedItem[]>(
        existingSalesReceivedItems
    )
    const [payments, setPayments] = useState<Payment[]>(
        generalLedgerToPayments(
            existingSalesReceived?.SalesReceived?.GeneralLedger || []
        )
    )
    const [documentRemarks, setDocumentRemarks] = useState<GetDocumentRemark[]>(
        existingSalesReceived?.DocumentRemark || []
    )

    const onCreateSalesBill = async () => {
        for (let payment of payments) {
            if (payment.amount === 0)
                return toast.error('จํานวนเงินต้องมากกว่า 0')

            if (payment.chartOfAccountId === 0)
                return toast.error('เลือกประเภทการชําระเงิน')
        }

        if (
            payments.reduce((a, b) => a + b.amount, 0) !==
            selectedItems.reduce((a, b) => a + b.amount, 0)
        )
            return toast.error('จำนวนเงินที่ชำระเงินไม่ตรงกัน')

        if (
            payments.reduce((a, b) => (b.isDeposit ? a + b.amount : a), 0) >
            depositAmount
        )
            return toast.error('เงินมัดจำไม่เพียงพอ')

        try {
            const result = await createSalesReceived(
                documentDetail,
                selectedItems,
                payments,
                documentRemarks
            )
            toast.success('บันทึกสําเร็จ')
        } catch (err) {
            if (err instanceof Error) return toast.error(err.message)
            toast.error('Something went wrong')
        }
    }

    const onUpdateSalesBill = async () => {
        if (!existingSalesReceived) {
            toast.error('ไม่พบใบเสร็จรับเงินที่ต้องการแก้ไข')
            return
        }
        for (let payment of payments) {
            if (payment.amount === 0)
                return toast.error('จํานวนเงินต้องมากกว่า 0')

            if (payment.chartOfAccountId === 0)
                return toast.error('เลือกประเภทการชําระเงิน')
        }

        if (
            payments.reduce((a, b) => a + b.amount, 0) !==
            selectedItems.reduce((a, b) => a + b.amount, 0)
        )
            return toast.error('จำนวนเงินที่ชำระเงินไม่ตรงกัน')

        if (
            payments.reduce((a, b) => (b.isDeposit ? a + b.amount : a), 0) >
            depositAmount
        )
            return toast.error('เงินมัดจำไม่เพียงพอ')

        try {
            const result = await updateSalesReceived(
                existingSalesReceived?.id,
                documentDetail,
                selectedItems,
                payments,
                documentRemarks
            )
            toast.success('บันทึกสําเร็จ')
        } catch (err) {
            if (err instanceof Error) return toast.error(err.message)
            toast.error('Something went wrong')
        }
    }

    const onDeleteSalesBill = async () => {
        try {
            if (!existingSalesReceived) {
                toast.error('ไม่พบใบเสร็จรับเงินที่ต้องการลบ')
                return
            }

            const result = await deleteSalesReceived(
                existingSalesReceived.documentNo
            )
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
                    disabled={existingSalesReceived ? true : false}
                />
                {existingSalesReceived && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button type="button" variant={'destructive'}>
                                ลบใบเสร็จรับเงิน
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="min-w-[800px]">
                            <DialogTitle className="w-full">
                                ลบใบเสร็จรับเงิน
                            </DialogTitle>
                            <p>คุณยืนยันที่จะลบใบเสร็จรับเงินหรือไม่</p>
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
                                !existingSalesReceived) && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center"
                                    >
                                        ไม่พบรายการขายของลูกค้า
                                    </TableCell>
                                </TableRow>
                            )}
                            {[
                                ...existingSalesReceivedItems,
                                ...unpaidItems,
                            ].map((item, index) => (
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
                        <TableCell colSpan={6} className="text-center">
                            <AddPaymentComponent
                                paymentMethods={paymentMethods}
                                payments={payments}
                                setPayments={setPayments}
                                depositAmount={depositAmount}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableHead colSpan={5}>
                            <div className="flex justify-end gap-2">
                                {existingSalesReceived ? (
                                    <Button
                                        disabled={selectedItems.length === 0}
                                        onClick={onUpdateSalesBill}
                                    >
                                        แก้ไขใบเสร็จรับเงิน
                                    </Button>
                                ) : (
                                    <Button
                                        disabled={selectedItems.length === 0}
                                        onClick={onCreateSalesBill}
                                    >
                                        สร้างใบเสร็จรับเงิน
                                    </Button>
                                )}
                                <Button variant={'destructive'}>รีเซ็ต</Button>
                            </div>
                        </TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={7}>
                            <CreateDocumentRemark
                                existingDocumentRemark={
                                    existingSalesReceived?.DocumentRemark || []
                                }
                                documentRemarks={documentRemarks}
                                setDocumentRemarks={setDocumentRemarks}
                            />
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}
