'use client'

import { searchAccountReceivable } from '@/app/actions/contact/searchAccountReceivable'
import { searchAccountReceivableById } from '@/app/actions/contact/searchAccountReceivableById'
import { DatePickerWithPresets } from '@/components/date-picker-preset'
import SelectSearch from '@/components/select-search'
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

type Props = {}

export default function NewSales({}: Props) {
    const ref = useRef<HTMLFormElement>(null)
    const [key, setKey] = useState('1')
    return (
        <div className="mb-2 p-3">
            <form
                ref={ref}
                action={async (formData) => {
                    try {
                        await createInvoice(formData)
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
                        <Input className="w-auto" placeholder="Optional" />
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

                    <TableBodyFooterWrapper key={key} />
                </Table>
            </form>
        </div>
    )
}
