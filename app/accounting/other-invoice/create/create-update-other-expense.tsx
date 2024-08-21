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
    AssetTypeToChartOfAccount,
    ChartOfAccount,
    DocumentRemark,
    PaymentStatus,
} from '@prisma/client'
import { XIcon } from 'lucide-react'
import React, { useEffect } from 'react'
import { createOtherInvoice } from './create-other-invoice'
import toast from 'react-hot-toast'
import { getPaymentMethods } from '@/app/actions/accounting'
import { DocumentItem } from '@/types/document-item'
import PaymentRemark from '@/components/table-caption/payment-remark'
import { updateOtherInvoice } from '../[documentNo]/edit/update-other-invoice'

type Props = {
    chartOfAccounts: (ChartOfAccount & {
        AssetTypeToChartOfAccount: AssetTypeToChartOfAccount | null
    })[]
    defaultItems?: {
        chartOfAccountId: number
        chartOfAccountName: string
        amount: number
        chartOfAccountType: AccountType
        assetName?: string
        assetUsefulLife?: number
        assetResidualValue?: number
        assetType: AssetType | undefined
    }[]
    defaultDocumentDetails?: {
        id: number
        date: Date
        documentNo: string
        referenceNo?: string
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

export default function CreateUpdateOtherExpenseComponent({
    chartOfAccounts,
    defaultItems = [],
    defaultDocumentDetails,
    paymentMethods,
    defaultPayments,
    defaultRemarks,
}: Props) {
    const [select, setSelect] = React.useState<string | undefined>()
    const [items, setItems] = React.useState<
        {
            chartOfAccountId: number
            chartOfAccountName: string
            amount: number
            chartOfAccountType: AccountType
            assetName?: string
            assetUsefulLife?: number
            assetResidualValue?: number
            assetType: AssetType | undefined
        }[]
    >(defaultItems || [])
    const [remarks, setRemarks] = React.useState<
        { id?: number; remark: string; isDeleted?: boolean }[]
    >(defaultRemarks || [])
    const [selectedPayments, setSelectedPayments] = React.useState<
        { id: number; amount: number }[]
    >(defaultPayments || [])

    return (
        <form
            className="p-3"
            action={async (formData) => {
                try {
                    if (
                        selectedPayments.reduce((a, b) => a + b.amount, 0) !==
                        items.reduce((acc, item) => acc + item.amount, 0)
                    ) {
                        return toast.error(
                            'จํานวนเงินที่ชําระไม่ถูกต้อง กรุณาตรวจสอบ'
                        )
                    }

                    if (defaultDocumentDetails) {
                        await updateOtherInvoice(
                            formData,
                            defaultDocumentDetails.id,
                            items,
                            selectedPayments,
                            remarks
                        )
                        return
                    }
                    const result = await createOtherInvoice(
                        formData,
                        items,
                        selectedPayments,
                        remarks
                    )
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
                <div className="flex gap-3">
                    <Label className="flex items-center gap-2 ">
                        <p>วันที่</p>
                        <DatePickerWithPresets
                            defaultDate={defaultDocumentDetails?.date}
                        />
                    </Label>
                    <Label className="flex items-center gap-2">
                        <p className="">No. </p>
                        <Input
                            className="w-auto"
                            name="documentNo"
                            placeholder=""
                            disabled
                            defaultValue={defaultDocumentDetails?.documentNo}
                        />
                    </Label>
                    <Label className="flex items-center gap-2">
                        <p className="">Ref. </p>
                        <Input
                            className="w-auto"
                            name="referenceNo"
                            placeholder="Optional"
                            defaultValue={defaultDocumentDetails?.referenceNo}
                        />
                    </Label>
                </div>
                <div className="my-1 flex items-baseline space-x-2">
                    <Label>คู่ค้า</Label>
                    <SelectSearchVendor
                        name="contactId"
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

                {/* <div className="my-1 flex items-baseline space-x-2">
                    <Label>เจ้าหนี้</Label>
                    <SelectSearchVendor
                        name="customerId"
                        hasTextArea={true}
                        placeholder="รหัสเจ้าหนี้"
                        // defaultValue={String(
                        //     defaultDocumentDetails?.contactId || ''
                        // )}
                        // defaultAddress={{
                        //     name: defaultDocumentDetails?.contactName || '',
                        //     address: defaultDocumentDetails?.address || '',
                        //     phone: defaultDocumentDetails?.phone || '',
                        //     taxId: defaultDocumentDetails?.taxId || '',
                        // }}
                    />
                </div> */}
            </div>
            <Table>
                <PaymentRemark
                    paymentMethods={paymentMethods}
                    defaultDocumentDetails={defaultDocumentDetails}
                    defaultPayments={defaultPayments}
                    defaultRemarks={defaultRemarks}
                    selectedPayments={selectedPayments}
                    setSelectedPayments={setSelectedPayments}
                    remarks={remarks}
                    setRemarks={setRemarks}
                />
                {/* <TableCaption></TableCaption> */}
                <TableHeader>
                    <TableRow>
                        <TableHead>รหัส</TableHead>
                        <TableHead>รายการ</TableHead>
                        <TableHead className="text-right">จำนวนเงิน</TableHead>
                        <TableHead>ชื่อสินทรัพย์</TableHead>
                        <TableHead>อายุการใช้งาน (ปี)</TableHead>
                        <TableHead>มูลค่าซาก</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.chartOfAccountId}</TableCell>
                            <TableCell>{item.chartOfAccountName}</TableCell>
                            <TableCell className="text-rignt">
                                <Input
                                    type="number"
                                    name="amount"
                                    placeholder="จำนวนเงิน"
                                    value={item.amount || ''}
                                    onChange={(e) =>
                                        setItems(
                                            items.map((item, i) =>
                                                i === index
                                                    ? {
                                                          ...item,
                                                          amount:
                                                              Number(
                                                                  e.target.value
                                                              ) || 0,
                                                      }
                                                    : item
                                            )
                                        )
                                    }
                                    // onKeyDown={handleKeyDown}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    disabled={
                                        item.chartOfAccountType !== 'Assets'
                                    }
                                    value={item.assetName}
                                    onChange={(e) =>
                                        setItems(
                                            items.map((item, i) =>
                                                i === index
                                                    ? {
                                                          ...item,
                                                          assetName:
                                                              e.target.value,
                                                      }
                                                    : item
                                            )
                                        )
                                    }
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    disabled={
                                        item.chartOfAccountType !== 'Assets'
                                    }
                                    type="number"
                                    value={item.assetUsefulLife || ''}
                                    onChange={(e) =>
                                        setItems(
                                            items.map((item, i) =>
                                                i === index
                                                    ? {
                                                          ...item,
                                                          assetUsefulLife:
                                                              Number(
                                                                  e.target.value
                                                              ) || undefined,
                                                      }
                                                    : item
                                            )
                                        )
                                    }
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    disabled={
                                        item.chartOfAccountType !== 'Assets'
                                    }
                                    type="number"
                                    value={item.assetResidualValue || ''}
                                    onChange={(e) =>
                                        setItems(
                                            items.map((item, i) =>
                                                i === index
                                                    ? {
                                                          ...item,
                                                          assetResidualValue:
                                                              Number(
                                                                  e.target.value
                                                              ) || undefined,
                                                      }
                                                    : item
                                            )
                                        )
                                    }
                                />
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
                                value={select}
                                onValueChange={(value) => {
                                    setSelect(value)
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
                                        {chartOfAccounts.map(({ id, name }) => (
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
                                disabled={!select}
                                onClick={() => {
                                    if (!select) return

                                    setItems([
                                        ...items,
                                        {
                                            chartOfAccountId: +select,
                                            chartOfAccountName:
                                                chartOfAccounts.find(
                                                    ({ id }) => id === +select
                                                )?.name || '',
                                            amount: 0,
                                            chartOfAccountType:
                                                chartOfAccounts.find(
                                                    ({ id }) => id === +select
                                                )?.type || 'OtherExpense',
                                            assetType:
                                                chartOfAccounts.find(
                                                    ({ id }) => id === +select
                                                )?.AssetTypeToChartOfAccount
                                                    ?.AssetType || undefined,
                                        },
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
                            {items.reduce((sum, item) => sum + item.amount, 0)}
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
