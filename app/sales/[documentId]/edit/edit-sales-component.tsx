'use client'

import { DatePickerWithPresets } from '@/components/date-picker-preset'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useRef } from 'react'
import {
    Table,
    TableCaption,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import TableBodyFooterWrapper from '@/components/select-search-main-sku/table-body-footer-wrapper'
import { createInvoice } from '@/app/actions/sales/create-invoice'
import toast from 'react-hot-toast'
import SelectSearchCustomer from '@/components/select-search-customer'
import { Textarea } from '@/components/ui/textarea'
import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'
import { updateInvoice } from '@/app/actions/sales/update-invoice'

type Props = {
    document: Awaited<ReturnType<typeof getSalesInvoiceDetail>>
}

export default function EditSales({ document }: Props) {
    const ref = useRef<HTMLFormElement>(null)
    const [key, setKey] = useState('1')
    return (
        <div className="mb-2 p-3">
            <form
                id="form"
                ref={ref}
                action={async (formData) => {
                    try {
                        document &&
                            (await updateInvoice(document?.id, formData))
                        ref.current?.reset()
                        setKey(String(Date.now()))
                        toast.success('บันทึกสําเร็จ')
                    } catch (err) {
                        if (err instanceof Error)
                            return toast.error(err.message)
                        toast.error('Something went wrong')
                    }
                }}
            >
                <div className="flex gap-3">
                    <div className="space-x-2">
                        <Label>วันที่</Label>
                        <DatePickerWithPresets key={key} />
                    </div>
                    <div className="space-x-2">
                        <Label>No.</Label>
                        <Input
                            className="w-auto"
                            placeholder="Optional"
                            defaultValue={document?.documentId}
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="my-1 flex items-baseline space-x-2">
                        <Label>ลูกหนี้</Label>
                        <SelectSearchCustomer
                            key={key}
                            name="customerId"
                            hasTextArea={true}
                            placeholder="รหัสลูกหนี้"
                            defaultValue={String(
                                document?.ArSubledger?.contactId || ''
                            )}
                            defaultAddress={{
                                address: `${document?.contactName || ''}\n${document?.address}`,
                                phone: document?.phone || '',
                                taxId: document?.taxId || '',
                            }}
                        />
                    </div>
                </div>
                <Table className="mt-3">
                    <TableCaption>
                        <Textarea placeholder="หมายเหตุ" name="remark" />
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Barcode</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">
                                Quantity
                            </TableHead>
                            <TableHead className="text-right">Unit</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBodyFooterWrapper
                        document={document}
                        isUpdated
                        key={key}
                    />
                </Table>
            </form>
        </div>
    )
}
