'use client'

import { searchAccountReceivable } from '@/app/actions/contact/searchAccountReceivable'
import searchAccountReceivableById from '@/app/actions/contact/searchAccountReceivableById'
import { DatePickerWithPresets } from '@/components/date-picker-preset'
import SelectSearch from '@/components/select-search'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useRef } from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import SelectSearchMainSku from '@/components/select-search-main-sku/select-search-main-sku'
import SelectSearchMainSkuWrapper from '@/components/select-search-main-sku/select-search-main-sku-wrapper'
import TableFooterWrapper from '@/components/select-search-main-sku/table-footer-wrapper'
import TableBodyFooterWrapper from '@/components/select-search-main-sku/table-body-footer-wrapper'
import { createPurchaseInvoice } from '@/app/actions/purchase/create-purchase-invoice'
import toast from 'react-hot-toast'

type Props = {
    searchParams: {
        page?: string
        limit?: string
        search?: string
    }
}

export default function NewPurchase({}: Props) {
    const ref = useRef<HTMLFormElement>(null)
    const [key, setKey] = useState('1')
    return (
        <div className="mb-2 p-3">
            <form
                ref={ref}
                action={async (formData) => {
                    try {
                        await createPurchaseInvoice(formData)
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
                        <Input className="w-auto" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-baseline space-x-2">
                        <Label>เจ้าหนี้</Label>
                        <SelectSearch
                            key={key}
                            searchFunction={searchAccountReceivable}
                            searchByIdFunction={searchAccountReceivableById}
                            keys={['id', 'name']}
                            keysMap={{ id: 'Id', name: 'ชื่อผู้ขาย' }}
                            name="vendorId"
                            hasTextArea={true}
                            textAreaKeys={['name']}
                        />
                    </div>
                </div>
                <Table className="mt-3">
                    <TableCaption>A list of your recent invoices.</TableCaption>
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

                    <TableBodyFooterWrapper type="purchase" key={key} />
                </Table>
            </form>
        </div>
    )
}
