'use client'

import { DatePickerWithPresets } from '@/components/date-picker-preset'
import { Button } from '@/components/ui/button'
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
import { Cross1Icon } from '@radix-ui/react-icons'
import React from 'react'
import { getSkuByBarcode } from './barcode-scanned'
import toast from 'react-hot-toast'
import SearchSkuDialog from './search-sku-dialog'
import SelectSearchVendor from '@/components/select-search-vendor'
import { createPurchaseInvoice } from './create-purchase-invoice'
import { updatePurchaseInvoice } from './update-purchase-invoice'
import { InventoryDetailType } from '@/types/inventory-detail'

type Props = {
    defaultItems?: InventoryDetailType[]
    defaultDocumentDetails?: {
        id: number
        date: Date
        documentId: string
        contactId: number
        contactName: string
        address: string
        phone: string
        taxId: string
        remark: string
    }
}

export default function CreateOrUpdatePurchaseInvoiceComponent({
    defaultItems = [],
    defaultDocumentDetails,
}: Props) {
    const [open, setOpen] = React.useState(false)
    const [items, setItems] =
        React.useState<InventoryDetailType[]>(defaultItems)
    const [barcodeInput, setBarcodeInput] = React.useState<string>('')
    const [key, setKey] = React.useState('1')

    return (
        <div className="p-3" key={key}>
            <Button variant="ghost">{`< Back`}</Button>
            <form
                action={async (formData) => {
                    try {
                        if (!defaultItems.length) {
                            await createPurchaseInvoice(formData, items)
                            setKey(String(Date.now()))
                            setItems([])
                        }

                        if (defaultDocumentDetails) {
                            await updatePurchaseInvoice(
                                defaultDocumentDetails.id,
                                formData,
                                items
                            )
                            toast.success('บันทึกสําเร็จ')
                        }
                    } catch (err) {
                        if (err instanceof Error)
                            return toast.error(err.message)
                        toast.error('Something went wrong')
                    }
                }}
            >
                <div className="flex flex-col gap-2">
                    <div className="flex gap-3">
                        <Label className="flex items-center gap-2">
                            <p className="">วันที่</p>
                            <DatePickerWithPresets
                                defaultDate={defaultDocumentDetails?.date}
                            />
                        </Label>
                        <Label className="flex items-center gap-2">
                            <p className="">No. </p>
                            <Input
                                className="w-auto"
                                name="documentId"
                                placeholder="Optional"
                                defaultValue={
                                    defaultDocumentDetails?.documentId
                                }
                            />
                        </Label>
                    </div>

                    {/* <Label className="flex items-center space-x-1">
                            <p className="">ลูกค้า</p>
                            <Input className="w-auto" placeholder="Optional" />
                        </Label> */}
                    <div className="my-1 flex items-baseline space-x-2">
                        <Label>คู่ค้า</Label>
                        <SelectSearchVendor
                            name="vendorId"
                            hasTextArea={true}
                            placeholder="รหัสคู่ค้า"
                            defaultValue={String(
                                defaultDocumentDetails?.contactId || ''
                            )}
                            defaultAddress={{
                                name: defaultDocumentDetails?.contactName || '',
                                address: defaultDocumentDetails?.address || '',
                                phone: defaultDocumentDetails?.phone || '',
                                taxId: defaultDocumentDetails?.taxId || '',
                            }}
                        />
                    </div>
                </div>
                <Table>
                    <TableCaption className="space-x-1 text-right"></TableCaption>
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
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={item.barcode}>
                                <TableCell>{item.barcode}</TableCell>
                                <TableCell>
                                    <p>{item.name}</p>
                                    <p className="text-primary/50">
                                        {item.detail}
                                    </p>
                                    <p className="text-primary/50">
                                        {item.partNumber}
                                    </p>
                                </TableCell>
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
                                                document.getElementById(
                                                    'barcode'
                                                )
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
                                                document.getElementById(
                                                    'barcode'
                                                )
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
                                    <Cross1Icon
                                        className="font-bold text-destructive hover:cursor-pointer"
                                        onClick={() =>
                                            setItems(
                                                items.filter(
                                                    (i) =>
                                                        i.barcode !==
                                                        item.barcode
                                                )
                                            )
                                        }
                                    />
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
                                            let barcode =
                                                splitedBarcode[0].trim()
                                            let quantity = 1
                                            if (splitedBarcode.length > 1) {
                                                barcode =
                                                    splitedBarcode[1].trim()
                                                quantity = parseFloat(
                                                    splitedBarcode[0].trim()
                                                )
                                            }
                                            if (!barcode.trim()) {
                                                return
                                            }
                                            const isExist = items.find(
                                                (item) =>
                                                    item.barcode === barcode
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
                                                    await getSkuByBarcode(
                                                        barcode
                                                    )
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
                                        return toast.error(
                                            'มีรายการนี้อยู่แล้ว'
                                        )
                                    }
                                    setItems([
                                        ...items,
                                        { ...data, quantity: 1 },
                                    ])
                                    setOpen(false)
                                }}
                            />
                        </TableRow>
                    </TableBody>
                    <TableFooter>
                        <TableRow className="border-b-2">
                            <TableCell colSpan={5} className="text-right">
                                Total
                            </TableCell>
                            <TableCell className="text-right">
                                {items.reduce(
                                    (acc, item) =>
                                        acc + item.price * item.quantity,
                                    0
                                )}
                            </TableCell>
                            <TableCell className="text-right"></TableCell>
                        </TableRow>
                        <TableRow className="bg-background hover:bg-background">
                            <TableCell
                                colSpan={6}
                                className="space-x-1 text-right"
                            >
                                <Button variant="destructive" type="button">
                                    Reset
                                </Button>
                                <Button type="submit">Save</Button>
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </form>
        </div>
    )
}
