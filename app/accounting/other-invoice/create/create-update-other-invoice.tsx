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
import { DocumentDetailForm } from '@/components/document-detail-form'
import {
    DocumentDetail,
    getDefaultDocumentDetail,
} from '@/types/document-detail'
import { GetServiceAndNonStockItem } from '@/types/service-and-non-stock-item/service-and-non-stock-item'
import { nonStockItemToDocumentItem } from '@/types/service-and-non-stock-item/non-stock-to-document-item'
import {
    inputNumberPreventDefault,
    onFocusPreventDefault,
} from '@/lib/input-number-prevent-default'
import { generalLedgerToPayments, Payment } from '@/types/payment/payment'
import { GetOtherInvoice } from '@/types/other-invoice/other-invoice'
import { GetDocumentRemark } from '@/types/remark/document-remark'
import AddPaymentComponent from '@/components/add-payment-component'
import CreateDocumentRemark from '@/components/create-document-remark'
import { getApPaymentMethods } from '@/app/actions/accounting'
import { otherInvoiceItemToDocumentItem } from '@/types/other-invoice/other-invoice-item'
import { updateOtherInvoice } from './update-other-invoice'
import { Switch } from '@/components/ui/switch'

type Props = {
    existingOtherInvoice?: GetOtherInvoice
    nonStockItems: GetServiceAndNonStockItem[]
    paymentMethods: Awaited<ReturnType<typeof getPaymentMethods>>
}

export default function CreateUpdateOtherInvoiceComponent({
    existingOtherInvoice,
    nonStockItems,
    paymentMethods,
}: Props) {
    const [documentDetail, setDocumentDetail] = React.useState<DocumentDetail>(
        getDefaultDocumentDetail()
    )
    const [items, setItems] = React.useState<DocumentItem[]>(
        otherInvoiceItemToDocumentItem(
            existingOtherInvoice?.OtherInvoice?.OtherInvoiceItem
        )
    )
    const [selectedNonStockItem, setSelectedNonStockItem] =
        React.useState<GetServiceAndNonStockItem>()

    const [payments, setPayments] = React.useState<Payment[]>(
        generalLedgerToPayments(
            existingOtherInvoice?.OtherInvoice?.GeneralLedger || [],
            { isAp: true, isCash: true },
            true
        )
    )
    const [documentRemarks, setDocumentRemarks] = React.useState<
        GetDocumentRemark[]
    >(existingOtherInvoice?.DocumentRemark || [])

    const [vatable, setVatable] = React.useState(true)
    const [isIncludeVat, setIsIncludeVat] = React.useState(true)
    return (
        <form
            className="p-3"
            action={async (formData) => {
                try {
                    const modifiedItems = items.map((item) => ({
                        ...item,
                        vatable: vatable,
                        isIncludeVat: isIncludeVat,
                    }))
                    if (!existingOtherInvoice) {
                        await createOtherInvoice(
                            documentDetail,
                            modifiedItems,
                            payments,
                            documentRemarks
                        )
                    } else {
                        await updateOtherInvoice(
                            existingOtherInvoice.id,
                            documentDetail,
                            modifiedItems,
                            payments,
                            documentRemarks
                        )
                    }
                    toast.success('บันทึกสําเร็จ')
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
            {/* <div className="p-2">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="vatable"
                        checked={vatable}
                        onCheckedChange={setVatable}
                    />
                    <Label htmlFor="vatable">มีภาษีมูลค่าเพิ่ม</Label>
                    <Switch
                        id="inclued-vat"
                        checked={isIncludeVat}
                        onCheckedChange={setIsIncludeVat}
                        disabled={!vatable}
                    />
                    <Label htmlFor="inclued-vat">รวมภาษี</Label>
                </div>
            </div> */}
            <Table>
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
                                        onKeyDown={(e) => {
                                            inputNumberPreventDefault(e)
                                        }}
                                        onFocus={onFocusPreventDefault}
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
                                        onKeyDown={(e) => {
                                            inputNumberPreventDefault(e)
                                        }}
                                        onFocus={onFocusPreventDefault}
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
                                value={String(selectedNonStockItem?.id)}
                                onValueChange={(value) => {
                                    setSelectedNonStockItem(
                                        nonStockItems.find(
                                            ({ id }) => id === Number(value)
                                        )
                                    )
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
                                            selectedNonStockItem
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
                    {vatable && (
                        <React.Fragment>
                            <TableRow>
                                <TableCell colSpan={4} className="text-right">
                                    <div className="flex w-full items-center justify-end space-x-2">
                                        <Switch
                                            id="vatable"
                                            checked={vatable}
                                            onCheckedChange={setVatable}
                                        />
                                        <Label htmlFor="vatable">
                                            มีภาษีมูลค่าเพิ่ม
                                        </Label>
                                        <Switch
                                            id="inclued-vat"
                                            checked={isIncludeVat}
                                            onCheckedChange={setIsIncludeVat}
                                            disabled={!vatable}
                                        />
                                        <Label htmlFor="inclued-vat">
                                            รวมภาษี
                                        </Label>
                                    </div>
                                </TableCell>
                                <TableCell colSpan={1} className="text-right">
                                    ราคาก่อนภาษี
                                </TableCell>
                                <TableCell className="text-right">
                                    {(+items
                                        .reduce(
                                            (sum, item) =>
                                                isIncludeVat
                                                    ? sum +
                                                      item.pricePerUnit *
                                                          (100 / 107)
                                                    : sum + item.pricePerUnit,
                                            0
                                        )
                                        .toFixed(2)).toLocaleString()}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={5} className="text-right">
                                    ภาษีมูลค่าเพิ่ม
                                </TableCell>
                                <TableCell className="text-right">
                                    {(+items
                                        .reduce(
                                            (sum, item) =>
                                                isIncludeVat
                                                    ? sum +
                                                      item.pricePerUnit *
                                                          (7 / 107)
                                                    : sum +
                                                      (item.pricePerUnit * 7) /
                                                          100,
                                            0
                                        )
                                        .toFixed(2)).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    )}
                    <TableRow>
                        <TableCell colSpan={4} className="text-right">
                            {!vatable && (
                                <div className="flex w-full items-center justify-end space-x-2">
                                    <Switch
                                        id="vatable"
                                        checked={vatable}
                                        onCheckedChange={setVatable}
                                    />
                                    <Label htmlFor="vatable">
                                        มีภาษีมูลค่าเพิ่ม
                                    </Label>
                                    <Switch
                                        id="inclued-vat"
                                        checked={isIncludeVat}
                                        onCheckedChange={setIsIncludeVat}
                                        disabled={!vatable}
                                    />
                                    <Label htmlFor="inclued-vat">รวมภาษี</Label>
                                </div>
                            )}
                        </TableCell>
                        <TableCell colSpan={1} className="text-right">
                            รวม
                        </TableCell>
                        <TableCell className="text-right">
                            {(+(
                                items.reduce(
                                    (sum, item) => sum + item.pricePerUnit,
                                    0
                                ) * (!vatable ? 1 : isIncludeVat ? 1 : 1.07)
                            ).toFixed(2)).toLocaleString()}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={7} className="text-center">
                            <AddPaymentComponent
                                paymentMethods={paymentMethods}
                                payments={payments}
                                setPayments={setPayments}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={7}>
                            <CreateDocumentRemark
                                existingDocumentRemark={
                                    existingOtherInvoice?.DocumentRemark || []
                                }
                                documentRemarks={documentRemarks}
                                setDocumentRemarks={setDocumentRemarks}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={6}>
                            <div className="flex justify-end gap-2">
                                {existingOtherInvoice ? (
                                    <Button disabled={items.length === 0}>
                                        แก้ไขใบเสร็จอื่น
                                    </Button>
                                ) : (
                                    <Button disabled={items.length === 0}>
                                        สร้างใบเสร็จอื่น
                                    </Button>
                                )}
                            </div>
                        </TableCell>
                        <TableHead></TableHead>
                    </TableRow>
                </TableFooter>
            </Table>
        </form>
    )
}
