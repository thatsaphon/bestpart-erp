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
import React, { useEffect } from 'react'
import { getSkuByBarcode } from '@/actions/barcode-scanned'
import toast from 'react-hot-toast'
import SearchSkuDialog from '@/components/search-sku-dialog'
import SelectSearchVendor from '@/components/select-search-vendor'
import { createPurchaseOrder } from './create-purchase-order'
import { updatePurchaseOrder } from './update-purchase-order'
import { DocumentItem } from '@/types/document-item'
import { DocumentRemark } from '@prisma/client'
import ImageToolTip from '@/components/image-tooltip'
import { Badge } from '@/components/ui/badge'
import { DocumentDetailForm } from '@/components/document-detail-form'
import {
    DocumentDetail,
    getDefaultDocumentDetail,
} from '@/types/document-detail'
import { purchaseItemsToDocumentItems } from '@/types/purchase/purchase-item'
import { GetCustomerOrder } from '@/types/customer-order/customer-order'
import { GetPurchaseOrder } from '@/types/purchase-order/purchase-order'
import { purchaseOrderItemsToDocumentItems } from '@/types/purchase-order/purchase-order-item'
import { GetDocumentRemark } from '@/types/remark/document-remark'
import ViewCustomerOrderDialog from '@/components/view-customer-order-dialog'

type Props = {
    existingPurchaseOrder?: GetPurchaseOrder
    existingCustomerOrders?: GetCustomerOrder[]
    openCustomerOrders?: GetCustomerOrder[]
}

export default function CreateOrUpdatePurchaseOrderComponent({
    existingPurchaseOrder,
    existingCustomerOrders = [],
    openCustomerOrders = [],
}: Props) {
    const [documentDetail, setDocumentDetail] = React.useState<DocumentDetail>(
        existingPurchaseOrder
            ? {
                  ...existingPurchaseOrder,
                  contactId: existingPurchaseOrder?.PurchaseOrder?.contactId,
              }
            : getDefaultDocumentDetail()
    )
    const [open, setOpen] = React.useState(false)
    const [items, setItems] = React.useState<DocumentItem[]>(
        purchaseOrderItemsToDocumentItems(
            existingPurchaseOrder?.PurchaseOrder?.PurchaseOrderItem
        )
    )
    const [barcodeInput, setBarcodeInput] = React.useState<string>('')
    const [key, setKey] = React.useState('1')
    const [documentRemarks, setDocumentRemarks] = React.useState<
        GetDocumentRemark[]
    >(existingPurchaseOrder?.DocumentRemark || [])
    // const [linkCustomerOrders, setLinkCustomerOrders] = React.useState<
    //     GetCustomerOrder[]
    // >(existingCustomerOrders || [])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter' && !open) {
                if (document.activeElement?.tagName === 'INPUT') {
                    event.preventDefault()
                }
            }
            if (event.key === 'Tab' && !open) {
                event.preventDefault()
                const focusedElement = document.activeElement as HTMLElement

                const focusableComponents = document.getElementById(
                    key
                ) as HTMLElement

                const focusableElements = focusableComponents.querySelectorAll(
                    'button, [href], input:not([type="hidden"]):not([hidden]), select, textarea, [tabindex]:not([tabindex="-1"])'
                )
                const focusedElementIndex =
                    Array.from(focusableElements).indexOf(focusedElement)
                const nextFocusedElementIndex =
                    focusedElementIndex + (event.shiftKey ? -1 : 1)
                const nextFocusedElement = focusableElements[
                    (nextFocusedElementIndex + focusableElements.length) %
                        focusableElements.length
                ] as HTMLElement
                nextFocusedElement.focus()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [key, open])

    return (
        <div id={key} className="p-3" key={key}>
            <Button variant="ghost">{`< Back`}</Button>
            <form
                action={async (formData) => {
                    try {
                        if (!existingPurchaseOrder) {
                            await createPurchaseOrder(documentDetail, items)
                            // setKey(String(Date.now()))
                            // setItems([])
                        }

                        if (existingPurchaseOrder) {
                            await updatePurchaseOrder(
                                existingPurchaseOrder.id,
                                documentDetail,
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
                <DocumentDetailForm
                    documentDetail={documentDetail}
                    setDocumentDetail={setDocumentDetail}
                    label="คู่ค้า"
                    placeholder="รหัสคู่ค้า"
                    disabled={!!existingPurchaseOrder}
                    useSearchParams={!existingPurchaseOrder}
                />
                <div className="flex items-center gap-2">
                    <ViewCustomerOrderDialog
                        customerOrders={[
                            ...existingCustomerOrders,
                            ...openCustomerOrders,
                        ]}
                    />
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

                                    <div>
                                        {item.MainSkuRemark &&
                                        item.SkuMasterRemark &&
                                        item.MainSkuRemark.length > 0 &&
                                        item.SkuMasterRemark.length > 0 ? (
                                            <p className="text-primary/50">{`Remark: ${[...item.MainSkuRemark?.map((remark) => remark.remark), ...item.SkuMasterRemark?.map((remark) => remark.remark)].join(', ')}`}</p>
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                    <div>
                                        <ImageToolTip images={item.Image} />
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Input
                                        id={`quantity-${index}`}
                                        className="w-16 text-right"
                                        type="number"
                                        value={item.quantity || undefined}
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
                                        value={item.pricePerUnit || undefined}
                                        onChange={(e) => {
                                            const newItems = [...items]
                                            newItems[index].pricePerUnit =
                                                Number(e.target.value)
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
                                        }}
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.pricePerUnit * item.quantity}
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
                                                        pricePerUnit:
                                                            result.lastPurchaseCostPerUnit ||
                                                            0,
                                                        vatable: true,
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
                                        {
                                            ...data,
                                            quantity: 1,
                                            pricePerUnit:
                                                data.lastPurchaseCostPerUnit ||
                                                0,
                                            vatable: true,
                                        },
                                    ])
                                    setOpen(false)
                                    setTimeout(() => {
                                        document
                                            .getElementById('barcode')
                                            ?.focus()
                                    }, 200)
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
                                        acc + item.pricePerUnit * item.quantity,
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
