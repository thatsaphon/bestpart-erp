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
import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import SearchSkuDialog from '@/components/search-sku-dialog'
import { defaultInventoryDetail, DocumentItem } from '@/types/document-item'
import SelectSearchCustomer from '@/components/select-search-customer'
import { useSession } from 'next-auth/react'
import { DocumentRemark } from '@prisma/client'
import { cn } from '@/lib/utils'
import { getSkuByBarcode } from '@/actions/barcode-scanned'
import { createCustomerOrder } from './create-customer-order'
import { updateCustomerOrder } from './update-customer-order'
import { Textarea } from '@/components/ui/textarea'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { GetCustomerOrder } from '@/types/customer-order/customer-order'
import { customerOrderItemsToDocumentItems } from '@/types/customer-order/customer-order-items'
import { GetDocumentRemark } from '@/types/remark/document-remark'
import { generalLedgerToPayments, Payment } from '@/types/payment/payment'
import {
    DocumentDetail,
    getDefaultDocumentDetail,
} from '@/types/document-detail'
import { DocumentDetailForm } from '@/components/document-detail-form'
import CreateDocumentRemark from '@/components/create-document-remark'
import AddPaymentComponent from '@/components/add-payment-component'

type Props = {
    existingCustomerOrder?: GetCustomerOrder
    paymentMethods: Awaited<ReturnType<typeof getPaymentMethods>>
}

export default function CreateOrUpdateCustomerOrderComponent({
    existingCustomerOrder,
    paymentMethods,
}: Props) {
    const formRef = useRef<HTMLFormElement>(null)
    const [documentDetail, setDocumentDetail] = useState<DocumentDetail>(
        existingCustomerOrder
            ? {
                  ...existingCustomerOrder,
                  contactId: existingCustomerOrder.CustomerOrder?.contactId,
              }
            : getDefaultDocumentDetail()
    )
    const [open, setOpen] = useState(false)
    const [items, setItems] = useState<DocumentItem[]>(
        customerOrderItemsToDocumentItems(
            existingCustomerOrder?.CustomerOrder?.CustomerOrderItem || []
        )
    )
    const [barcodeInput, setBarcodeInput] = useState<string>('')
    const [key, setKey] = useState('1')
    const session = useSession()
    const [documentRemarks, setDocumentRemarks] = useState<GetDocumentRemark[]>(
        existingCustomerOrder?.DocumentRemark || []
    )
    const [payments, setPayments] = useState<Payment[]>(
        generalLedgerToPayments(
            existingCustomerOrder?.CustomerOrder?.GeneralLedger || [],
            { isCash: true }
        )
    )

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
                        if (!existingCustomerOrder) {
                            await createCustomerOrder(
                                documentDetail,
                                items,
                                payments,
                                documentRemarks
                            )
                            setKey(String(Date.now()))
                            setItems([])
                            toast.success('บันทึกสําเร็จ')
                        }
                        if (existingCustomerOrder) {
                            await updateCustomerOrder(
                                existingCustomerOrder?.id,
                                documentDetail,
                                items,
                                payments,
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
                    documentDetail={documentDetail}
                    setDocumentDetail={setDocumentDetail}
                    useSearchParams={existingCustomerOrder ? false : true}
                    disabled={existingCustomerOrder ? true : false}
                    label="ลูกค้า"
                />
                <div>
                    {existingCustomerOrder && (
                        <Badge>
                            {existingCustomerOrder.CustomerOrder?.status}
                        </Badge>
                    )}
                </div>
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
                            <TableHead className="w-5"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={item.barcode}>
                                <TableCell>{item.barcode || '-'}</TableCell>
                                <TableCell>
                                    <Textarea
                                        id={`description-${index}`}
                                        value={item.name}
                                        onChange={(e) => {
                                            const newItems = [...items]
                                            newItems[index].name =
                                                e.target.value
                                            setItems(newItems)
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                const newItems = [...items]
                                                newItems[index].name += '\n'
                                                setItems(newItems)
                                            }
                                        }}
                                    />
                                    {/* <p>{item.name}</p>
                                    <p className="text-primary/50">
                                        {item.detail}
                                    </p>
                                    <p className="text-primary/50">
                                        {item.partNumber}
                                    </p>
                                    <div>
                                        {item.MainSkuRemarks &&
                                        item.SkuMasterRemarks &&
                                        item.MainSkuRemarks.length > 0 &&
                                        item.SkuMasterRemarks.length > 0 ? (
                                            <p className="text-primary/50">{`Remark: ${[...item.MainSkuRemarks?.map((remark) => remark.remark), ...item.SkuMasterRemarks?.map((remark) => remark.remark)].join(', ')}`}</p>
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                    <div>
                                        <ImageToolTip images={item.images} />
                                    </div> */}
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
                                    {item.barcode ? (
                                        `${item.unit}(${item.quantityPerUnit})`
                                    ) : (
                                        <Input
                                            className="w-16 text-right"
                                            value={item.unit}
                                            onChange={(e) => {
                                                const newItems = [...items]
                                                newItems[index].unit =
                                                    e.target.value
                                                setItems(newItems)
                                            }}
                                        />
                                    )}
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
                                                    (i, iIndex) =>
                                                        index !== iIndex
                                                )
                                            )
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={5} className="text-right">
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
                                                        name:
                                                            result.name +
                                                            '\n' +
                                                            result.detail,
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
                                <SearchSkuDialog
                                    isOpen={open}
                                    setIsOpen={setOpen}
                                    onSelected={(data) => {
                                        const isExist = items.find(
                                            (item) =>
                                                item.barcode === data.barcode
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
                                                name:
                                                    data.name +
                                                    '\n' +
                                                    data.detail,
                                            },
                                        ])
                                        setOpen(false)
                                        setTimeout(() => {
                                            document
                                                .getElementById('barcode')
                                                ?.focus()
                                        }, 100)
                                    }}
                                />
                            </TableCell>
                            <TableCell className="w-4 text-right">
                                <Button
                                    type="button"
                                    onClick={() =>
                                        setItems([
                                            ...items,
                                            {
                                                ...defaultInventoryDetail(),
                                                name: '',
                                            },
                                        ])
                                    }
                                >
                                    เพิ่ม
                                </Button>
                            </TableCell>
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
                        <TableRow>
                            <TableCell colSpan={7} className="text-center">
                                <AddPaymentComponent
                                    paymentMethods={paymentMethods.filter(
                                        ({ isCash }) => isCash
                                    )}
                                    payments={payments}
                                    setPayments={setPayments}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={7}>
                                <CreateDocumentRemark
                                    existingDocumentRemark={
                                        existingCustomerOrder?.DocumentRemark ||
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
                                    {existingCustomerOrder ? (
                                        <Button disabled={items.length === 0}>
                                            แก้ไขใบจองสินค้า
                                        </Button>
                                    ) : (
                                        <Button disabled={items.length === 0}>
                                            สร้างใบจองสินค้า
                                        </Button>
                                    )}
                                    <Button
                                        variant={'destructive'}
                                        type="button"
                                        onClick={(e) => {
                                            setKey(String(Date.now()))
                                            setItems(
                                                customerOrderItemsToDocumentItems(
                                                    existingCustomerOrder
                                                        ?.CustomerOrder
                                                        ?.CustomerOrderItem ||
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
