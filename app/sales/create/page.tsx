import { searchAccountReceivable } from '@/app/actions/contact/searchAccountReceivable'
import searchAccountReceivableById from '@/app/actions/contact/searchAccountReceivableById'
import { DatePickerWithPresets } from '@/components/date-picker-preset'
import SelectSearch from '@/components/select-search'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
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

type Props = {
    searchParams: {
        page?: string
        limit?: string
        search?: string
    }
}

export default function NewSales({}: Props) {
    return (
        <div className="mb-2 p-3">
            <form action="">
                <div className="flex gap-3">
                    <div className="space-x-2">
                        <Label>วันที่</Label>
                        <DatePickerWithPresets />
                    </div>
                    <div className="space-x-2">
                        <Label>No.</Label>
                        <Input className="w-auto" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-baseline space-x-2">
                        <Label>ลูกหนี้</Label>
                        <SelectSearch
                            searchFunction={searchAccountReceivable}
                            searchByIdFunction={searchAccountReceivableById}
                            keys={['id', 'name']}
                            keysMap={{ id: 'Id', name: 'ชื่อลูกค้า' }}
                            name="ar"
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
                        </TableRow>
                    </TableHeader>

                    <TableBodyFooterWrapper />
                </Table>
            </form>
        </div>
    )
}
