'use client'

import { DocumentDetailForm } from '@/components/document-detail-form'
import {
    DocumentDetail,
    getDefaultDocumentDetail,
} from '@/types/document-detail'
import { useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
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
import toast from 'react-hot-toast'
import { generalLedgerToPayments, Payment } from '@/types/payment/payment'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import AddPaymentComponent from '@/components/add-payment-component'
import { GetDocumentRemark } from '@/types/remark/document-remark'
import { GetOtherPayment } from '@/types/other-payment/other-payment'
import { OtherPaymentItem } from '@/types/other-payment/other-payment-item'
import { createOtherPayment } from './create-other-payment'
import { updateOtherPayment } from './update-other-payment'
import { deleteOtherPayment } from './delete-other-payment'

type Props = {
    existingOtherPayment?: GetOtherPayment
    existingOtherPaymentItems?: OtherPaymentItem[]
    unpaidItems: OtherPaymentItem[]
    paymentMethods: Awaited<ReturnType<typeof getPaymentMethods>>
}

export default function CreateUpdateOtherPaymentComponents({
    existingOtherPayment,
    existingOtherPaymentItems = [],
    unpaidItems,
    paymentMethods,
}: Props) {
    const [documentDetail, setDocumentDetail] = useState<DocumentDetail>(
        existingOtherPayment
            ? {
                  ...existingOtherPayment,
                  contactId: existingOtherPayment?.OtherPayment?.contactId,
              }
            : getDefaultDocumentDetail()
    )
    const [open, setOpen] = useState(false)
    const [selectedItems, setSelectedItems] = useState<OtherPaymentItem[]>(
        existingOtherPaymentItems
    )
    const [payments, setPayments] = useState<Payment[]>(
        generalLedgerToPayments(
            existingOtherPayment?.OtherPayment?.GeneralLedger || [],
            { isCash: true }
        )
    )
    const [documentRemarks, setDocumentRemarks] = useState<GetDocumentRemark[]>(
        existingOtherPayment?.DocumentRemark || []
    )

    const onCreateOtherPayment = async () => {
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

        try {
            const result = await createOtherPayment(
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

    const onUpdateOtherPayment = async () => {
        if (!existingOtherPayment) {
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

        try {
            const result = await updateOtherPayment(
                existingOtherPayment?.id,
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

    const onDeleteOtherPayment = async () => {
        try {
            if (!existingOtherPayment) {
                toast.error('ไม่พบใบเสร็จรับเงินที่ต้องการลบ')
                return
            }

            const result = await deleteOtherPayment(
                existingOtherPayment.documentNo
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
                    disabled={existingOtherPayment ? true : false}
                />
                {existingOtherPayment && (
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
                                        onClick={onDeleteOtherPayment}
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
                                !existingOtherPayment) && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center"
                                    >
                                        ไม่พบรายการขายของลูกค้า
                                    </TableCell>
                                </TableRow>
                            )}
                            {[...existingOtherPaymentItems, ...unpaidItems].map(
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
                                            {Math.abs(
                                                item.amount
                                            ).toLocaleString()}
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
                                                              {
                                                                  ...item,
                                                                  amount: -item.amount,
                                                              },
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
                        <TableCell colSpan={6} className="text-center">
                            <AddPaymentComponent
                                paymentMethods={paymentMethods.filter(
                                    (x) => x.isCash
                                )}
                                payments={payments}
                                setPayments={setPayments}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableHead colSpan={5}>
                            <div className="flex justify-end gap-2">
                                {existingOtherPayment ? (
                                    <Button
                                        disabled={selectedItems.length === 0}
                                        onClick={onUpdateOtherPayment}
                                    >
                                        แก้ไขใบเสร็จรับเงิน
                                    </Button>
                                ) : (
                                    <Button
                                        disabled={selectedItems.length === 0}
                                        onClick={onCreateOtherPayment}
                                    >
                                        สร้างใบเสร็จรับเงิน
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
