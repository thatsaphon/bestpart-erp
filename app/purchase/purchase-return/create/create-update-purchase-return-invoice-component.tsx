'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
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
import { DocumentItem } from '@/types/document-item'
import { useSession } from 'next-auth/react'
import ImageToolTip from '@/components/image-tooltip'
import { DocumentDetailForm } from '@/components/document-detail-form'
import {
    DocumentDetail,
    getDefaultDocumentDetail,
} from '@/types/document-detail'
import { createPurchaseReturnInvoice } from './create-purchase-return-invoice'
import { updatePurchaseReturnInvoice } from './update-purchase-return-invoice'
import { GetDocumentRemark } from '@/types/remark/document-remark'
import CreateDocumentRemark from '@/components/create-document-remark'
import { GetPurchaseReturn } from '@/types/purchase-return/purchase-return'
import { PurchaseReturnItemsToDocumentItems } from '@/types/purchase-return/purchase-return-item'
import DocumentItemFooter from '@/components/document-item-footer'
import { convertPricePerUnitToCostPerUnit } from '@/lib/convert-price-per-unit-to-cost-per-unit'

type Props = {
    existingPurchaseReturn?: GetPurchaseReturn
}

export default function CreateOrUpdatePurchaseReturnInvoiceComponent({
    existingPurchaseReturn,
}: Props) {
    const [documentDetail, setDocumentDetail] = React.useState<DocumentDetail>(
        existingPurchaseReturn
            ? {
                  ...existingPurchaseReturn,
                  contactId: existingPurchaseReturn?.PurchaseReturn?.contactId,
              }
            : getDefaultDocumentDetail()
    )
    const formRef = React.useRef<HTMLFormElement>(null)
    const [open, setOpen] = React.useState(false)
    const [items, setItems] = React.useState<DocumentItem[]>(
        PurchaseReturnItemsToDocumentItems(
            existingPurchaseReturn?.PurchaseReturn?.PurchaseReturnItem
        )
    )
    const [barcodeInput, setBarcodeInput] = React.useState<string>('')
    const [key, setKey] = React.useState('1')
    const session = useSession()
    const [documentRemarks, setDocumentRemarks] = React.useState<
        GetDocumentRemark[]
    >(existingPurchaseReturn?.DocumentRemark || [])
    const [vatable, setVatable] = React.useState(true)
    const [isIncludeVat, setIsIncludeVat] = React.useState<boolean>(true)

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter' && !open) {
                event.preventDefault()
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
        <div className="p-3" id={key} key={key}>
            <form
                ref={formRef}
                action={async (formData) => {
                    try {
                        if (!existingPurchaseReturn) {
                            await createPurchaseReturnInvoice(
                                // formData,
                                documentDetail,
                                convertPricePerUnitToCostPerUnit(
                                    items,
                                    vatable,
                                    isIncludeVat
                                ),
                                documentRemarks
                            )
                            toast.success('บันทึกสําเร็จ')
                        }
                        if (existingPurchaseReturn) {
                            await updatePurchaseReturnInvoice(
                                existingPurchaseReturn.id,
                                documentDetail,
                                convertPricePerUnitToCostPerUnit(
                                    items,
                                    vatable,
                                    isIncludeVat
                                ),
                                documentRemarks
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
                    setDocumentDetail={setDocumentDetail}
                    documentDetail={documentDetail}
                    label="ผู้ขาย"
                    placeholder="รหัสผู้ขาย"
                />
                <Table>
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
                                        {[
                                            ...item.MainSkuRemark,
                                            ...item.SkuMasterRemark,
                                        ].map((remark) => (
                                            <p
                                                className="text-primary/50"
                                                key={`${remark.id}-${remark.remark}`}
                                            >
                                                {remark?.remark}
                                            </p>
                                        ))}
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
                                        disabled={
                                            session.data?.user.role !== 'ADMIN'
                                        }
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
                                                    (_, i) => i !== index
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
                                                        pricePerUnit: 0,
                                                    },
                                                ])
                                                setBarcodeInput('')
                                            } catch (error) {
                                                if (error instanceof Error)
                                                    return toast.error(
                                                        error.message
                                                    )
                                                return toast.error(
                                                    'something went wrong'
                                                )
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
                                            pricePerUnit: 0,
                                        },
                                    ])
                                    setOpen(false)
                                    setTimeout(() => {
                                        document
                                            .getElementById('barcode')
                                            ?.focus()
                                    }, 100)
                                }}
                                nonStockTypes={['Purchase']}
                            />
                        </TableRow>
                    </TableBody>
                    <TableFooter>
                        <DocumentItemFooter
                            vatable={vatable}
                            setVatable={setVatable}
                            isIncludeVat={isIncludeVat}
                            setIsIncludeVat={setIsIncludeVat}
                            items={items}
                        />
                        <TableRow>
                            <TableCell colSpan={7}>
                                <CreateDocumentRemark
                                    existingDocumentRemark={
                                        existingPurchaseReturn?.DocumentRemark ||
                                        []
                                    }
                                    documentRemarks={documentRemarks}
                                    setDocumentRemarks={setDocumentRemarks}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={6}>
                                <div className="flex justify-end gap-2">
                                    {existingPurchaseReturn ? (
                                        <Button disabled={items.length === 0}>
                                            แก้ไขใบลดหนี้
                                        </Button>
                                    ) : (
                                        <Button disabled={items.length === 0}>
                                            สร้างใบลดหนี้
                                        </Button>
                                    )}
                                    <Button
                                        variant={'destructive'}
                                        type="button"
                                        onClick={(e) => {
                                            setKey(String(Date.now()))
                                            setItems(
                                                PurchaseReturnItemsToDocumentItems(
                                                    existingPurchaseReturn
                                                        ?.PurchaseReturn
                                                        ?.PurchaseReturnItem ||
                                                        []
                                                )
                                            )
                                        }}
                                    >
                                        รีเซ็ต
                                    </Button>
                                </div>
                            </TableCell>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableFooter>
                </Table>
            </form>
        </div>
    )
}
