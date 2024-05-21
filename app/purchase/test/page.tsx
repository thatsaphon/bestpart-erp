'use client'

import { DatePickerWithPresets } from '@/components/date-picker-preset'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
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
import { getSkuByBarcode } from './barcode-scanned'
import toast from 'react-hot-toast'
import SearchSkuDialog from './search-sku-dialog'

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
            partNumber: string
        }[]
    >([])
    const [barcodeInput, setBarcodeInput] = React.useState<string>('')

    return (
        <div className="p-3">
            <Button variant="ghost">{`< Back`}</Button>

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
                    {items.map((item, index) => (
                        <TableRow key={item.barcode}>
                            <TableCell>{item.barcode}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">
                                <Input
                                    id={`quantity-${index}`}
                                    className="w-16 text-right"
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => {
                                        const newItems = [...items]
                                        newItems[index].quantity = Number(
                                            e.target.value
                                        )
                                        setItems(newItems)
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Tab') return

                                        const barcodeElement =
                                            document.getElementById('barcode')
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            barcodeElement?.focus()
                                        }
                                        if (e.key === 'ArrowDown') {
                                            e.preventDefault()
                                            const nextElement =
                                                document.getElementById(
                                                    `quantity-${index + 1}`
                                                )
                                            nextElement
                                                ? nextElement.focus()
                                                : barcodeElement?.focus()
                                        }
                                        if (e.key === 'ArrowUp') {
                                            e.preventDefault()
                                            const previousElement =
                                                document.getElementById(
                                                    `quantity-${index - 1}`
                                                )
                                            previousElement?.focus()
                                        }
                                        if (
                                            e.key === 'ArrowRight' &&
                                            !e.shiftKey
                                        ) {
                                            const priceElement =
                                                document.getElementById(
                                                    `price-${index}`
                                                )
                                            priceElement?.focus()
                                        }
                                    }}
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                {`${item.unit}(${item.quantityPerUnit})`}
                            </TableCell>
                            <TableCell className="text-right">
                                <Input
                                    id={`price-${index}`}
                                    className="w-16 text-right"
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => {
                                        const newItems = [...items]
                                        newItems[index].price = Number(
                                            e.target.value
                                        )
                                        setItems(newItems)
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Tab') return

                                        const barcodeElement =
                                            document.getElementById('barcode')
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            barcodeElement?.focus()
                                        }
                                        if (e.key === 'ArrowDown') {
                                            e.preventDefault()
                                            const nextElement =
                                                document.getElementById(
                                                    `price-${index + 1}`
                                                )
                                            nextElement
                                                ? nextElement.focus()
                                                : barcodeElement?.focus()
                                        }
                                        if (e.key === 'ArrowUp') {
                                            e.preventDefault()
                                            const previousElement =
                                                document.getElementById(
                                                    `price-${index - 1}`
                                                )
                                            previousElement
                                                ? previousElement.focus()
                                                : null
                                        }
                                        if (
                                            e.key === 'ArrowLeft' &&
                                            !e.shiftKey
                                        ) {
                                            const quantityElement =
                                                document.getElementById(
                                                    `quantity-${index}`
                                                )
                                            quantityElement?.focus()
                                        }
                                    }}
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                {item.price * item.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                                <Cross1Icon className="font-bold text-destructive hover:cursor-pointer" />
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell colSpan={6} className="text-right">
                            <Input
                                id="barcode"
                                value={barcodeInput}
                                onChange={(e) => {
                                    setBarcodeInput(e.target.value)
                                }}
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        let splitedBarcode =
                                            e.currentTarget.value.split('*')
                                        let barcode = splitedBarcode[0].trim()
                                        let quantity = 1
                                        if (splitedBarcode.length > 1) {
                                            barcode = splitedBarcode[1].trim()
                                            quantity = parseFloat(
                                                splitedBarcode[0].trim()
                                            )
                                        }
                                        if (!barcode.trim()) {
                                            return
                                        }
                                        const isExist = items.find(
                                            (item) => item.barcode === barcode
                                        )
                                        if (isExist) {
                                            setItems(
                                                items.map((item) =>
                                                    item.barcode === barcode
                                                        ? {
                                                              ...item,
                                                              quantity:
                                                                  item.quantity +
                                                                  quantity,
                                                          }
                                                        : item
                                                )
                                            )
                                            setBarcodeInput('')
                                            return
                                        }
                                        try {
                                            const result =
                                                await getSkuByBarcode(barcode)
                                            setItems([
                                                ...items,
                                                {
                                                    ...result,
                                                    quantity,
                                                    price: 0,
                                                },
                                            ])
                                            setBarcodeInput('')
                                        } catch (error) {
                                            toast.error('ไม่พบ Barcode นี้')
                                            return
                                        }
                                    }
                                    if (e.key === 'ArrowUp') {
                                        document
                                            .getElementById(
                                                `quantity-${items.length - 1}`
                                            )
                                            ?.focus()
                                    }
                                    if (e.code === 'Slash' && e.shiftKey) {
                                        e.preventDefault()
                                        setOpen(true)
                                    }
                                }}
                            />
                        </TableCell>
                        <SearchSkuDialog
                            isOpen={open}
                            setIsOpen={setOpen}
                            onSelected={(data) => {
                                const isExist = items.find(
                                    (item) => item.barcode === data.barcode
                                )
                                if (isExist) {
                                    return toast.error('มีรายการนี้อยู่แล้ว')
                                }
                                setItems([...items, { ...data, quantity: 1 }])
                                setOpen(false)
                            }}
                        />
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
