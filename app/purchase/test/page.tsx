'use client'

import { DatePickerWithPresets } from '@/components/date-picker-preset'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Cross1Icon, PlusCircledIcon } from '@radix-ui/react-icons'
import React from 'react'
import { searchSku } from './search-sku'

type Props = {}

export default function TestCreateInvoice({}: Props) {
    const [open, setOpen] = React.useState(false)
    const [dialogType, setDialogType] = React.useState<'contact' | 'sku'>(
        'contact'
    )
    const [items, setItems] = React.useState<
        {
            barcode: string
            name: string
            detail: string
            unit: string
            quantityPerUnit: number
            quantity: number
            price: number
        }[]
    >([])

    return (
        <div className="p-3">
            <Button variant="ghost">{`< Back`}</Button>
            {/* <Dialog open={open} onOpenChange={setOpen}>
                {}
            </Dialog> */}

            <div className="flex flex-col gap-2">
                <Label className="flex items-center space-x-1">
                    <p className="">วันที่</p>
                    <DatePickerWithPresets />
                </Label>
                <div>
                    <Label className="flex items-center space-x-1">
                        <p className="">ลูกค้า</p>
                        <Input className="w-auto" placeholder="Optional" />
                    </Label>
                </div>
            </div>
            <Table>
                <TableCaption></TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Barcode</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={6} className="text-right">
                            <Input
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        searchSku(e.currentTarget.value)
                                    }
                                }}
                            />
                        </TableCell>
                        {items.map((item) => (
                            <TableRow key={item.barcode}>
                                <TableCell>{item.barcode}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">
                                    {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.unit}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.price}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.price}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Cross1Icon className="font-bold text-destructive hover:cursor-pointer" />
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableCell colSpan={6} className="text-right">
                            {/* Total */}
                            <PlusCircledIcon className="h-6 w-full text-center text-primary/50 hover:cursor-pointer hover:text-primary" />
                        </TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={5} className="text-right">
                            Total
                        </TableCell>
                        <TableCell className="text-right"></TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}
