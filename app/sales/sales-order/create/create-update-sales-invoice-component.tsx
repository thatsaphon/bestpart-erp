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
import { createSalesInvoice } from './create-sales-invoice'
import { InventoryDetailType } from '@/types/inventory-detail'
import { updateSalesInvoice } from './update-sales-invoice'
import SelectSearchCustomer from '@/components/select-search-customer'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import ImageToolTip from '@/components/image-tooltip'
import { DocumentRemark, PaymentStatus } from '@prisma/client'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getPaymentMethods } from '@/app/actions/accounting'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Props = {
    defaultItems?: InventoryDetailType[]
    defaultDocumentDetails?: {
        id: number
        date: Date
        documentNo: string
        contactId: number
        contactName: string
        address: string
        phone: string
        taxId: string
        documentRemarks: DocumentRemark[]
        paymentStatus: PaymentStatus
    }
    paymentMethods: Awaited<ReturnType<typeof getPaymentMethods>>
    defaultPayments?: { id: number; amount: number }[]
    defaultRemarks?: { id: number; remark: string; isDeleted?: boolean }[]
}

export default function CreateOrUpdateSalesInvoiceComponent({
    defaultItems = [],
    defaultDocumentDetails,
    paymentMethods,
    defaultPayments,
    defaultRemarks,
}: Props) {
    const formRef = React.useRef<HTMLFormElement>(null)
    const [open, setOpen] = React.useState(false)
    const [items, setItems] =
        React.useState<InventoryDetailType[]>(defaultItems)
    const [barcodeInput, setBarcodeInput] = React.useState<string>('')
    const [key, setKey] = React.useState('1')
    const session = useSession()
    const [remarks, setRemarks] = React.useState<
        { id?: number; remark: string; isDeleted?: boolean }[]
    >(defaultRemarks || [])
    const [remarkInput, setRemarkInput] = React.useState<string>('')
    const [selectedPayments, setSelectedPayments] = React.useState<
        { id: number; amount: number }[]
    >(defaultPayments || [])
    const [selectedPayment, setSelectedPayment] = React.useState<
        number | undefined
    >()
    const [paymentAmount, setPaymentAmount] = React.useState<
        number | undefined
    >()

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

    const addRemark = () => {
        if (!remarkInput) return
        setRemarks((prev) => [...prev, { remark: remarkInput }])
        setRemarkInput('')
    }

    const removeRemark = (index: number) => {
        // setRemarks((prev) => prev.filter((_, i) => i !== index))
        const remarkToRemove = remarks[index]
        if (remarkToRemove.id) {
            setRemarks((prev) =>
                prev.map((remark) =>
                    remark.id === remarkToRemove.id
                        ? { ...remark, isDeleted: true }
                        : remark
                )
            )
        } else {
            setRemarks((prev) => prev.filter((_, i) => i !== index))
        }
    }

    const addPayment = () => {
        if (!selectedPayment || !paymentAmount) {
            toast.error('กรุณาเลือกช่องทางการชําระเงินหรือจำนวนเงิน')
            return
        }
        setSelectedPayments((prev) => [
            ...prev,
            { id: selectedPayment, amount: paymentAmount },
        ])
        setSelectedPayment(undefined)
        setPaymentAmount(undefined)
    }

    return (
        <div className="p-3" id={key} key={key}>
            <form
                ref={formRef}
                action={async (formData) => {
                    try {
                        if (
                            selectedPayments.reduce(
                                (a, b) => a + b.amount,
                                0
                            ) !==
                            items.reduce(
                                (acc, item) => acc + item.price * item.quantity,
                                0
                            )
                        ) {
                            return toast.error(
                                'จํานวนเงินที่ชําระไม่ถูกต้อง กรุณาตรวจสอบ'
                            )
                        }
                        if (!defaultItems.length) {
                            await createSalesInvoice(
                                formData,
                                items,
                                selectedPayments,
                                remarks
                            )
                            setKey(String(Date.now()))
                            setItems([])
                            toast.success('บันทึกสําเร็จ')
                        }

                        if (defaultDocumentDetails) {
                            await updateSalesInvoice(
                                defaultDocumentDetails.id,
                                formData,
                                items,
                                selectedPayments,
                                remarks
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
                                name="documentNo"
                                placeholder="Optional"
                                defaultValue={
                                    defaultDocumentDetails?.documentNo
                                }
                            />
                        </Label>
                    </div>
                    <div className="my-1 flex items-baseline space-x-2">
                        <Label>ลูกค้า</Label>
                        <SelectSearchCustomer
                            name="customerId"
                            hasTextArea={true}
                            placeholder="รหัสลูกค้า"
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
                    <TableCaption>
                        <div className="w-[650px] space-y-1">
                            <div className="flex items-center gap-1 text-left">
                                ช่องทางชำระเงิน:{' '}
                                {!defaultDocumentDetails ? (
                                    <></>
                                ) : defaultDocumentDetails?.paymentStatus ===
                                  'Paid' ? (
                                    <Badge className="bg-green-400">
                                        จ่ายแล้ว
                                    </Badge>
                                ) : defaultDocumentDetails?.paymentStatus ===
                                  'Billed' ? (
                                    <Badge variant={`secondary`}>
                                        วางบิลแล้ว
                                    </Badge>
                                ) : defaultDocumentDetails?.paymentStatus ===
                                  'PartialPaid' ? (
                                    <Badge variant={'destructive'}>
                                        จ่ายบางส่วน
                                    </Badge>
                                ) : !defaultDocumentDetails?.paymentStatus ? (
                                    <Badge className="bg-green-400">
                                        เงินสด
                                    </Badge>
                                ) : (
                                    <Badge variant={'destructive'}>
                                        ยังไม่จ่าย
                                    </Badge>
                                )}
                            </div>
                            {selectedPayments.map((item) => (
                                <div
                                    key={item.id}
                                    className={cn(
                                        'grid grid-cols-[1fr_1fr_140px] items-center gap-1 text-primary',
                                        defaultDocumentDetails?.paymentStatus ===
                                            'Billed' && 'grid-cols-2'
                                    )}
                                >
                                    <p>
                                        {paymentMethods.find(
                                            (p) => p.id === item.id
                                        )?.id === 12000
                                            ? 'เงินเชื่อ'
                                            : paymentMethods.find(
                                                  (p) => p.id === item.id
                                              )?.name}
                                    </p>
                                    <p>{item.amount}</p>
                                    <Cross1Icon
                                        className={cn(
                                            'cursor-pointer text-destructive',
                                            defaultDocumentDetails?.paymentStatus ===
                                                'Billed' && 'hidden'
                                        )}
                                        onClick={() =>
                                            setSelectedPayments(
                                                selectedPayments.filter(
                                                    (p) => p.id !== item.id
                                                )
                                            )
                                        }
                                    />
                                </div>
                            ))}
                            <div
                                className={cn(
                                    'grid grid-cols-[1fr_1fr_140px] items-center gap-1',
                                    defaultDocumentDetails?.paymentStatus ===
                                        'Billed' && 'hidden'
                                )}
                            >
                                <Select
                                    name="paymentMethodId"
                                    onValueChange={(e) =>
                                        setSelectedPayment(Number(e))
                                    }
                                    value={String(selectedPayment)}
                                >
                                    <SelectTrigger className="">
                                        <SelectValue
                                            placeholder={'เลือกช่องทางชำระเงิน'}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>
                                                ช่องทางชำระเงิน
                                            </SelectLabel>
                                            {paymentMethods
                                                .filter(
                                                    ({ id }) =>
                                                        !selectedPayments.find(
                                                            (p) => p.id === id
                                                        )
                                                )
                                                .map((item) => (
                                                    <SelectItem
                                                        key={item.id}
                                                        value={String(item.id)}
                                                    >
                                                        {item.id === 12000
                                                            ? 'เงินเชื่อ'
                                                            : item.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Input
                                    name="amount"
                                    type="number"
                                    placeholder="จำนวนเงิน"
                                    onChange={(e) =>
                                        setPaymentAmount(Number(e.target.value))
                                    }
                                    value={paymentAmount || ''}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            addPayment()
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={() => addPayment()}
                                >
                                    เพิ่มการชำระเงิน
                                </Button>
                            </div>
                            {defaultDocumentDetails?.paymentStatus ===
                                'Billed' && (
                                <p className="text-destructive">วางบิลแล้ว</p>
                            )}

                            <p className="text-left">หมายเหตุ:</p>
                            {remarks.map((remark, index) => (
                                <p
                                    className={cn(
                                        'grid grid-cols-[1fr_20px] items-center gap-1 text-left text-primary',
                                        remark.isDeleted &&
                                            'text-primary/50 line-through'
                                    )}
                                    key={'remark-' + index}
                                >
                                    <span>{remark.remark}</span>
                                    <Cross1Icon
                                        className={cn(
                                            'font-bold text-destructive hover:cursor-pointer',
                                            remark.isDeleted && 'hidden'
                                        )}
                                        onClick={() => removeRemark(index)}
                                    />
                                </p>
                            ))}
                            <div className="grid grid-cols-[1fr_140px] items-center gap-1">
                                <Input
                                    name="remark"
                                    onChange={(e) =>
                                        setRemarkInput(e.target.value)
                                    }
                                    value={remarkInput}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            addRemark()
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={() => addRemark()}
                                >
                                    เพิ่มหมายเหตุ
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 flex w-[600px] justify-end gap-1">
                            <Button
                                variant="destructive"
                                type="button"
                                onClick={(e) => {
                                    setKey(String(Date.now()))
                                    setItems(defaultItems)
                                }}
                            >
                                Reset
                            </Button>
                            <Button type="submit">Save</Button>
                        </div>
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
                                        {item.MainSkuRemarks &&
                                        item.SkuMasterRemarks &&
                                        item.MainSkuRemarks.length > 0 &&
                                        item.SkuMasterRemarks.length > 0 ? (
                                            <p className="text-primary/50">{`Remark: ${[...item.MainSkuRemarks?.map((remark) => remark.name), ...item.SkuMasterRemarks?.map((remark) => remark.name)].join(', ')}`}</p>
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                    <div>
                                        <ImageToolTip images={item.images} />
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
                                        value={item.price || undefined}
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
                    </TableFooter>
                </Table>
            </form>
        </div>
    )
}
