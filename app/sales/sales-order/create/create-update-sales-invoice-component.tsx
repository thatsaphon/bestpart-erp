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
import { createSalesInvoice } from './create-sales-invoice'
import { DocumentItem } from '@/types/document-item'
import { updateSalesInvoice } from './update-sales-invoice'
import { useSession } from 'next-auth/react'
import ImageToolTip from '@/components/image-tooltip'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import { GetSales } from '@/types/sales/sales'
import { salesItemsToDocumentItems } from '@/types/sales/sales-item'
import { DocumentDetailForm } from '@/components/document-detail-form'
import {
    DocumentDetail,
    getDefaultDocumentDetail,
} from '@/types/document-detail'
import AddPaymentComponent from '@/components/add-payment-component'
import { generalLedgerToPayments, Payment } from '@/types/payment/payment'
import { GetQuotation } from '@/types/quotation/quotation'
import { GetCustomerOrder } from '@/types/customer-order/customer-order'
import ViewQuotationDialog from '@/components/view-quotation-dialog'
import ViewCustomerOrderDialog from '@/components/view-customer-order-dialog'
import CreateDocumentRemark from '@/components/create-document-remark'
import { GetDocumentRemark } from '@/types/remark/document-remark'
import CustomerOrderHoverCard from '@/components/customer-order-hover-card'
import useSecondDisplayStore from '@/store/second-display-store'

type Props = {
    existingSales?: GetSales
    paymentMethods: Awaited<ReturnType<typeof getPaymentMethods>>
    depositAmount?: number
    quotations?: GetQuotation[]
    pendingOrExistingCustomerOrders?: GetCustomerOrder[]
}

export default function CreateOrUpdateSalesInvoiceComponent({
    existingSales: existingSales,
    paymentMethods,
    depositAmount = 0,
    quotations = [],
    pendingOrExistingCustomerOrders = [],
}: Props) {
    const store = useSecondDisplayStore()
    const [documentDetail, setDocumentDetail] = React.useState<DocumentDetail>(
        existingSales
            ? { ...existingSales, contactId: existingSales?.Sales?.contactId }
            : getDefaultDocumentDetail()
    )
    const formRef = React.useRef<HTMLFormElement>(null)
    const [open, setOpen] = React.useState(false)
    const [items, setItems] = React.useState<DocumentItem[]>(
        salesItemsToDocumentItems(existingSales?.Sales?.SalesItem)
    )
    const [barcodeInput, setBarcodeInput] = React.useState<string>('')
    const [key, setKey] = React.useState('1')
    const session = useSession()
    const [documentRemarks, setDocumentRemarks] = React.useState<
        GetDocumentRemark[]
    >(existingSales?.DocumentRemark || [])
    const [payments, setPayments] = React.useState<Payment[]>(
        generalLedgerToPayments(existingSales?.Sales?.GeneralLedger || [], {
            isCash: true,
            isAr: true,
            isDeposit: true,
        })
    )
    const [selectedCustomerOrderIds, setSelectedCustomerOrderIds] =
        React.useState<number[]>(
            existingSales?.Sales?.CustomerOrder.map(
                (customerOrder) => customerOrder.documentId
            ) || []
        )

    useEffect(() => {
        console.log('items changed')
        console.log(store.customerWindow)
        store.postDocumentDetail(documentDetail)
        store.postItems(items)
    }, [items, documentDetail])

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
                        if (
                            payments.reduce((a, b) => a + b.amount, 0) !==
                            items.reduce(
                                (acc, item) =>
                                    acc + item.pricePerUnit * item.quantity,
                                0
                            )
                        ) {
                            toast.error(
                                'จํานวนเงินที่ชําระไม่ถูกต้อง กรุณาตรวจสอบ'
                            )
                            return
                        }
                        if (!existingSales) {
                            await createSalesInvoice(
                                // formData,
                                documentDetail,
                                items,
                                payments,
                                documentRemarks,
                                selectedCustomerOrderIds
                            )
                            // setKey(String(Date.now()))
                            // setItems([])
                            toast.success('บันทึกสําเร็จ')
                        }
                        if (existingSales) {
                            await updateSalesInvoice(
                                existingSales.id,
                                documentDetail,
                                items,
                                payments,
                                documentRemarks,
                                selectedCustomerOrderIds
                            )
                            toast.success('บันทึกสําเร็จ')
                        }
                    } catch (err) {
                        if (err instanceof Error) {
                            if (err.message === 'NEXT_REDIRECT') {
                                toast.success('บันทึกสําเร็จ')
                                return
                            }
                            toast.error(err.message)
                            return
                        }
                        toast.error('Something went wrong')
                    }
                }}
            >
                <DocumentDetailForm
                    setDocumentDetail={setDocumentDetail}
                    documentDetail={documentDetail}
                    label="ลูกค้า"
                    placeholder="รหัสลูกค้า"
                    useSearchParams={existingSales ? false : true}
                    disabled={existingSales ? true : false}
                />
                <div className="space-x-3 p-2">
                    <ViewQuotationDialog quotations={quotations}>
                        <Button type="button" variant={'outline'}>
                            ดูใบเสนอราคา
                        </Button>
                    </ViewQuotationDialog>
                    <ViewCustomerOrderDialog
                        customerOrders={pendingOrExistingCustomerOrders}
                        selectedCustomerOrderIds={selectedCustomerOrderIds}
                        onSelect={(customerOrder) => {
                            setSelectedCustomerOrderIds([
                                ...selectedCustomerOrderIds,
                                customerOrder.id,
                            ])
                        }}
                        onRemove={(customerOrder) => {
                            setSelectedCustomerOrderIds(
                                selectedCustomerOrderIds.filter(
                                    (id) => id !== customerOrder.id
                                )
                            )
                        }}
                    >
                        <Button type="button" variant={'outline'}>
                            ดูใบจองสินค้า
                        </Button>
                    </ViewCustomerOrderDialog>
                </div>
                {pendingOrExistingCustomerOrders.length && (
                    <div className="flex items-center gap-2">
                        <span>ใบจองสินค้า:</span>
                        {pendingOrExistingCustomerOrders
                            .filter((customerOrder) =>
                                selectedCustomerOrderIds.includes(
                                    customerOrder.id
                                )
                            )
                            .map((customerOrder) => (
                                <CustomerOrderHoverCard
                                    key={customerOrder.id}
                                    customerOrder={customerOrder}
                                />
                            ))}
                    </div>
                )}
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
                            <TableHead className="w-[50px]"></TableHead>
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
                                            [
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
                            <TableCell colSpan={7} className="text-right">
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
                                        { ...data, quantity: 1 },
                                    ])
                                    setOpen(false)
                                    setTimeout(() => {
                                        document
                                            .getElementById('barcode')
                                            ?.focus()
                                    }, 100)
                                }}
                                nonStockTypes={['Sales']}
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
                        <TableRow>
                            <TableCell colSpan={7} className="text-center">
                                <AddPaymentComponent
                                    paymentMethods={paymentMethods}
                                    payments={payments}
                                    setPayments={setPayments}
                                    depositAmount={depositAmount}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={7}>
                                <CreateDocumentRemark
                                    existingDocumentRemark={
                                        existingSales?.DocumentRemark || []
                                    }
                                    documentRemarks={documentRemarks}
                                    setDocumentRemarks={setDocumentRemarks}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={6}>
                                <div className="flex justify-end gap-2">
                                    {existingSales ? (
                                        <Button disabled={items.length === 0}>
                                            แก้ไขรายการขาย
                                        </Button>
                                    ) : (
                                        <Button disabled={items.length === 0}>
                                            สร้างรายการขาย
                                        </Button>
                                    )}
                                    <Button
                                        variant={'destructive'}
                                        type="button"
                                        onClick={(e) => {
                                            setKey(String(Date.now()))
                                            setItems(
                                                salesItemsToDocumentItems(
                                                    existingSales?.Sales
                                                        ?.SalesItem || []
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
