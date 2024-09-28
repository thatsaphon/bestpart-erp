'use client'

import { DatePickerWithPresets } from '@/components/date-picker-preset'
import SelectSearchVendor from '@/components/select-search-vendor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectLabel,
    SelectGroup,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    TableBody,
    TableCell,
    TableFooter,
    TableHeader,
    TableRow,
    Table,
    TableHead,
    TableCaption,
} from '@/components/ui/table'
import {
    AccountType,
    AssetType,
    ChartOfAccount,
    DocumentRemark,
} from '@prisma/client'
import { XIcon } from 'lucide-react'
import React, { useEffect } from 'react'
import { createOtherInvoice } from './create-other-invoice'
import toast from 'react-hot-toast'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import { DocumentItem } from '@/types/document-item'
import { updateOtherInvoice } from '../[documentNo]/edit/update-other-invoice'
import { DocumentDetailForm } from '@/components/document-detail-form'
import {
    DocumentDetail,
    getDefaultDocumentDetail,
} from '@/types/document-detail'
import { GetServiceAndNonStockItem } from '@/types/service-and-non-stock-item/service-and-non-stock-item'
import { nonStockItemToDocumentItem } from '@/types/service-and-non-stock-item/non-stock-to-document-item'

type Props = {
    nonStockItems: GetServiceAndNonStockItem[]
}

export default function CreateUpdateOtherInvoiceComponent({
    nonStockItems,
}: Props) {
    const [documentDetail, setDocumentDetail] = React.useState<DocumentDetail>(
        getDefaultDocumentDetail()
    )
    const [items, setItems] = React.useState<DocumentItem[]>([])
    const [selectedNonStockItem, setSelectedNonStockItem] =
        React.useState<number>()
    return (
        <form
            className="p-3"
            action={async (formData) => {
                try {
                } catch (err) {
                    if (err instanceof Error) {
                        return toast.error(err.message)
                    }

                    return toast.error('Something went wrong')
                }
            }}
        >
            <div className="flex flex-col gap-2">
                <DocumentDetailForm
                    documentDetail={documentDetail}
                    setDocumentDetail={setDocumentDetail}
                    label="คู่ค้า"
                />
            </div>
            <Table>
                {/* <PaymentRemark
                    paymentMethods={paymentMethods}
                    defaultDocumentDetails={defaultDocumentDetails}
                    defaultPayments={defaultPayments}
                    defaultRemarks={defaultRemarks}
                    selectedPayments={selectedPayments}
                    setSelectedPayments={setSelectedPayments}
                    remarks={remarks}
                    setRemarks={setRemarks}
                /> */}
                {/* <TableCaption></TableCaption> */}
                <TableHeader>
                    <TableRow>
                        <TableHead>ชื่อรายการ</TableHead>
                        <TableHead>รายละเอียด</TableHead>
                        <TableHead className="text-right">จำนวน</TableHead>
                        <TableHead className="text-right">หน่วย</TableHead>
                        <TableHead className="text-right">
                            ราคาต่อหน่วย
                        </TableHead>
                        <TableHead className="text-right">
                            รวมเป็นเงิน
                        </TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                                <Input
                                    value={item.detail}
                                    onChange={(e) => {
                                        setItems(
                                            items.map((item, i) =>
                                                i === index
                                                    ? {
                                                          ...item,
                                                          detail: e.target
                                                              .value,
                                                      }
                                                    : item
                                            )
                                        )
                                    }}
                                />
                            </TableCell>
                            <TableCell className="text-rignt">
                                <div className="flex justify-end">
                                    <Input
                                        type="number"
                                        className="w-24 text-right"
                                        placeholder="จำนวน"
                                        value={item.quantity || ''}
                                        onChange={(e) =>
                                            setItems(
                                                items.map((item, i) =>
                                                    i === index
                                                        ? {
                                                              ...item,
                                                              quantity:
                                                                  Number(
                                                                      e.target
                                                                          .value
                                                                  ) || 0,
                                                          }
                                                        : item
                                                )
                                            )
                                        }
                                    />
                                </div>
                            </TableCell>
                            <TableCell className="text-rignt">
                                <div className="flex justify-end">
                                    <Input
                                        className="w-24 text-right"
                                        placeholder="หน่วย"
                                        value={item.unit || ''}
                                        onChange={(e) =>
                                            setItems(
                                                items.map((item, i) =>
                                                    i === index
                                                        ? {
                                                              ...item,
                                                              unit: e.target
                                                                  .value,
                                                          }
                                                        : item
                                                )
                                            )
                                        }
                                    />
                                </div>
                            </TableCell>
                            <TableCell className="text-rignt">
                                <div className="flex justify-end">
                                    <Input
                                        type="number"
                                        name="amount"
                                        className="w-24 text-right"
                                        placeholder="จำนวนเงิน"
                                        value={item.pricePerUnit || ''}
                                        onChange={(e) =>
                                            setItems(
                                                items.map((item, i) =>
                                                    i === index
                                                        ? {
                                                              ...item,
                                                              pricePerUnit:
                                                                  Number(
                                                                      e.target
                                                                          .value
                                                                  ) || 0,
                                                          }
                                                        : item
                                                )
                                            )
                                        }
                                    />
                                </div>
                            </TableCell>
                            <TableCell className="text-end">
                                {(
                                    item.quantity * item.pricePerUnit
                                ).toLocaleString()}
                            </TableCell>
                            <TableCell>
                                <XIcon
                                    onClick={() =>
                                        setItems(
                                            items.filter((_, i) => i !== index)
                                        )
                                    }
                                    className="h-4 w-4 cursor-pointer text-destructive"
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell colSpan={6}>
                            <Select
                                value={String(selectedNonStockItem)}
                                onValueChange={(value) => {
                                    setSelectedNonStockItem(+value)
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกประเภทค่าใช้จ่าย" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>
                                            เลือกประเภทค่าใช้จ่าย
                                        </SelectLabel>
                                        {nonStockItems.map(({ id, name }) => (
                                            <SelectItem
                                                key={id}
                                                value={String(id)}
                                            >
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </TableCell>
                        <TableCell>
                            <Button
                                type="button"
                                disabled={!selectedNonStockItem}
                                onClick={() => {
                                    if (!selectedNonStockItem) return

                                    setItems([
                                        ...items,
                                        nonStockItemToDocumentItem(
                                            nonStockItems.find(
                                                ({ id }) =>
                                                    id === selectedNonStockItem
                                            )!
                                        ),
                                    ])
                                }}
                            >
                                เพิ่ม
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={2} className="text-right">
                            รวม
                        </TableCell>
                        <TableCell className="text-right">
                            {items.reduce(
                                (sum, item) => sum + item.pricePerUnit,
                                0
                            )}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
            <div className="mx-[20%] flex justify-end">
                <Button disabled={items.length === 0}>ยืนยัน</Button>
            </div>
        </form>
    )
}
