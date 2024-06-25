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
import { AccountType, ChartOfAccount } from '@prisma/client'
import { XIcon } from 'lucide-react'
import React, { useEffect } from 'react'

type Props = {
    chartOfAccounts: ChartOfAccount[]
}

export default function CreateUpdateOtherExpenseComponent({
    chartOfAccounts,
}: Props) {
    const [select, setSelect] = React.useState<string | undefined>()
    const [items, setItems] = React.useState<
        {
            id: number
            name: string
            amount: number | undefined
            type: AccountType
        }[]
    >([])

    // const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    //     if (
    //         event.key === 'ArrowUp' ||
    //         event.key === 'ArrowDown' ||
    //         event.key === 'Enter'
    //     ) {
    //         event.preventDefault()
    //     }
    // }

    // useEffect(() => {
    //     const handleKeyDown = (event: KeyboardEvent) => {
    //         if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    //             event.preventDefault()
    //         }
    //         if (event.key === 'Enter') {
    //             event.preventDefault()
    //         }
    //     }
    //     const inputElements = document.querySelectorAll<HTMLInputElement>(
    //         'input[type="number"]'
    //     )
    //     inputElements.forEach((element) => {
    //         element.addEventListener('keydown', handleKeyDown)
    //     })

    //     return () => {
    //         inputElements.forEach((element) => {
    //             element.removeEventListener('keydown', handleKeyDown)
    //         })
    //     }
    // }, [items])

    return (
        <form className="p-3">
            <div className="flex flex-col gap-2">
                <div className="flex gap-3">
                    <Label className="flex items-center gap-2 ">
                        <p>วันที่</p>
                        <DatePickerWithPresets
                        // defaultDate={defaultDocumentDetails?.date}
                        />
                    </Label>
                    <Label className="flex items-center gap-2">
                        <p className="">No. </p>
                        <Input
                            className="w-auto"
                            name="documentId"
                            placeholder=""
                            disabled
                            // defaultValue={
                            //     defaultDocumentDetails?.documentId
                            // }
                        />
                    </Label>
                    <Label className="flex items-center gap-2">
                        <p className="">Ref. </p>
                        <Input
                            className="w-auto"
                            name="referenceNo"
                            // placeholder="Optional"
                            // defaultValue={
                            //     defaultDocumentDetails?.documentId
                            // }
                        />
                    </Label>
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
                <TableCaption></TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>รหัส</TableHead>
                        <TableHead>รายการ</TableHead>
                        <TableHead className="text-right">จำนวนเงิน</TableHead>
                        <TableHead>อายุการใช้งาน (ปี)</TableHead>
                        <TableHead>มูลค่าซาก</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
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
                                                              ) || undefined,
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
                                    disabled={item.type !== 'Assets'}
                                    type="number"
                                    // onKeyDown={handleKeyDown}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    disabled={item.type !== 'Assets'}
                                    type="number"
                                    // onKeyDown={handleKeyDown}
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
                        <TableCell colSpan={5}>
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
                                            id: +select,
                                            name:
                                                chartOfAccounts.find(
                                                    ({ id }) => id === +select
                                                )?.name || '',
                                            amount: undefined,
                                            type:
                                                chartOfAccounts.find(
                                                    ({ id }) => id === +select
                                                )?.type || 'OtherExpense',
                                        },
                                    ])
                                }}
                            >
                                เพิ่ม
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter></TableFooter>
            </Table>
        </form>
    )
}
