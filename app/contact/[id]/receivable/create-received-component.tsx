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
import React from 'react'
import toast from 'react-hot-toast'
import SelectSearchCustomer from '@/components/select-search-customer'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Prisma } from '@prisma/client'
import { createBillingNote } from './create-billing-note'
import { fullDateFormat } from '@/lib/date-format'

const documentWithGeneralLedgerArSubledger =
    Prisma.validator<Prisma.DocumentDefaultArgs>()({
        include: { GeneralLedger: true, ArSubledger: true },
    })
type DocumentAr = Prisma.DocumentGetPayload<
    typeof documentWithGeneralLedgerArSubledger
>

type Props = {
    defaultItems?: DocumentAr[]
    defaultDocumentDetails?: {
        id: number
        date: Date
        documentNo: string
        contactId: number
        contactName: string
        address: string
        phone: string
        taxId: string
        remark: string
    }
}

export default function CreateBillingNote({
    defaultItems = [],
    defaultDocumentDetails,
}: Props) {
    const formRef = React.useRef<HTMLFormElement>(null)
    const [open, setOpen] = React.useState(false)
    const [items, setItems] = React.useState<DocumentAr[]>(defaultItems)
    const [barcodeInput, setBarcodeInput] = React.useState<string>('')
    const [key, setKey] = React.useState('1')
    const session = useSession()

    return (
        <div className="p-3" key={key}>
            <div className="flex justify-between">
                <Link href="/sales/sales-order">
                    <Button variant="ghost" className="mb-2">{`< Back`}</Button>
                </Link>
                <Link href="/sales/create">
                    <Button
                        variant="ghost"
                        className="mb-2"
                    >{`Create New`}</Button>
                </Link>
            </div>
            <form
                ref={formRef}
                action={async (formData) => {
                    try {
                        await createBillingNote(
                            formData,
                            items.map((item) => item.documentNo)
                        )
                        setKey(String(Date.now()))
                        setItems([])
                        toast.success('บันทึกสําเร็จ')
                        if (!defaultItems.length) {
                        }

                        if (defaultDocumentDetails) {
                            // await updateSalesInvoice(
                            //     defaultDocumentDetails.id,
                            //     formData,
                            //     items
                            // )
                            // toast.success('บันทึกสําเร็จ')
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
                    <TableCaption className="space-x-1 text-right"></TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>วันที่</TableHead>
                            <TableHead>เลขที่</TableHead>
                            <TableHead className="text-right">
                                จำนวนเงิน
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={item.documentNo}>
                                <TableCell>
                                    {fullDateFormat(item.date)}
                                </TableCell>
                                <TableCell>
                                    <p>{item.documentNo}</p>
                                </TableCell>

                                <TableCell className="text-right">
                                    <Input
                                        disabled
                                        id={`price-${index}`}
                                        className="w-16 text-right"
                                        type="number"
                                        value={item.GeneralLedger[0].amount}
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
                                    // onKeyDown={async (e) => {
                                    //     if (e.key === 'Enter') {
                                    //         e.preventDefault()
                                    //         let splitedBarcode =
                                    //             e.currentTarget.value.split('*')
                                    //         let barcode =
                                    //             splitedBarcode[0].trim()
                                    //         let quantity = 1
                                    //         if (splitedBarcode.length > 1) {
                                    //             barcode =
                                    //                 splitedBarcode[1].trim()
                                    //             quantity = parseFloat(
                                    //                 splitedBarcode[0].trim()
                                    //             )
                                    //         }
                                    //         if (!barcode.trim()) {
                                    //             return
                                    //         }
                                    //         const isExist = items.find(
                                    //             (item) =>
                                    //                 item.barcode === barcode
                                    //         )
                                    //         if (isExist) {
                                    //             setItems(
                                    //                 items.map((item) =>
                                    //                     item.barcode === barcode
                                    //                         ? {
                                    //                               ...item,
                                    //                               quantity:
                                    //                                   item.quantity +
                                    //                                   quantity,
                                    //                           }
                                    //                         : item
                                    //                 )
                                    //             )
                                    //             setBarcodeInput('')
                                    //             return
                                    //         }
                                    //         try {
                                    //             const result =
                                    //                 await getSkuByBarcode(
                                    //                     barcode
                                    //                 )
                                    //             setItems([
                                    //                 ...items,
                                    //                 {
                                    //                     ...result,
                                    //                     quantity,
                                    //                     price: 0,
                                    //                 },
                                    //             ])
                                    //             setBarcodeInput('')
                                    //         } catch (error) {
                                    //             toast.error('ไม่พบ Barcode นี้')
                                    //             return
                                    //         }
                                    //     }
                                    //     if (e.key === 'ArrowUp') {
                                    //         document
                                    //             .getElementById(
                                    //                 `quantity-${items.length - 1}`
                                    //             )
                                    //             ?.focus()
                                    //     }
                                    //     if (e.code === 'Slash' && e.shiftKey) {
                                    //         e.preventDefault()
                                    //         setOpen(true)
                                    //     }
                                    // }}
                                />
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
                                        acc + item.GeneralLedger[0].amount,
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
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </form>
        </div>
    )
}
