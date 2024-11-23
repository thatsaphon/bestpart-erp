'use client'

import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import DateFormfield from '@/components/date-formfield'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    inputNumberPreventDefault,
    onFocusPreventDefault,
} from '@/lib/input-number-prevent-default'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ChartOfAccount, Prisma } from '@prisma/client'
import { createJournalVoucher } from './create-journal-voucher'
import { GetJournalVoucher } from '@/types/journal-voucher/journal-voucher'
import { updateJournalVoucher } from './update-journal-voucher'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Cross1Icon,
    CrossCircledIcon,
    PlusCircledIcon,
} from '@radix-ui/react-icons'

const formSchema = z.object({
    journalDescription: z
        .string({ message: 'กรุณากรอกคำอธิบาย' })
        .min(1, { message: 'กรุณากรอกคำอธิบาย' }),
    date: z.date().optional().default(new Date()),
    documentNo: z.string().optional().default(''),
    items: z.array(
        z.object({
            chartOfAccountId: z.coerce.number({
                invalid_type_error: 'กรุณาเลือกบัญชี',
            }),
            type: z.enum(['Debit', 'Credit']),
            amount: z.coerce
                .number({
                    invalid_type_error: 'กรุณาระบุจํานวนเงิน',
                })
                .min(0.01, { message: 'จำนวนเงินต้องมากกว่า 0' }),
        })
    ),
})
type Props = {
    chartOfAccounts: ChartOfAccount[]
    existingJournalVoucher?: GetJournalVoucher
}

export default function CreateUpdateJournalVoucher({
    chartOfAccounts,
    existingJournalVoucher,
}: Props) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: existingJournalVoucher
            ? {
                  journalDescription:
                      existingJournalVoucher.JournalVoucher
                          ?.journalDescription || '',
                  date: existingJournalVoucher.date,
                  documentNo: existingJournalVoucher.documentNo,
                  items: existingJournalVoucher.JournalVoucher?.GeneralLedger.map(
                      ({ chartOfAccountId, amount }) => ({
                          chartOfAccountId: chartOfAccountId,
                          type: amount > 0 ? 'Debit' : 'Credit',
                          amount: Math.abs(amount),
                      })
                  ),
              }
            : {
                  items: [{ type: 'Debit' }, { type: 'Credit' }],
              },
    })

    const formArray = useFieldArray({ name: 'items', control: form.control })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        if (
            values.items.reduce(
                (acc, item) =>
                    item.type === 'Debit'
                        ? acc + item.amount
                        : acc - item.amount,
                0
            ) !== 0
        ) {
            form.setError('root', {
                type: 'custom',
                message: 'จำนวนเงิน Debit และ Credit ต้องเท่ากัน',
            })
            return
        }
        if (!existingJournalVoucher) {
            await createJournalVoucher(
                values.journalDescription,
                values.date,
                values.items.map((item) => ({
                    chartOfAccountId: item.chartOfAccountId,
                    amount: item.type === 'Debit' ? item.amount : -item.amount,
                })),
                values.documentNo,
                []
            )
        }
        if (existingJournalVoucher) {
            await updateJournalVoucher(
                existingJournalVoucher.id,
                values.journalDescription,
                values.date,
                values.items.map((item) => ({
                    chartOfAccountId: item.chartOfAccountId,
                    amount: item.type === 'Debit' ? item.amount : -item.amount,
                })),
                values.documentNo,
                []
            )
        }
    }
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 p-2"
            >
                <div className="w-[700px] space-y-4">
                    <FormField
                        control={form.control}
                        name="journalDescription"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>คำอธิบาย</FormLabel>
                                <FormControl>
                                    <Input placeholder="คำอธิบาย" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DateFormfield name="date" label="วันที่" />
                    <FormField
                        control={form.control}
                        name="documentNo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Document No</FormLabel>
                                <FormControl>
                                    <Input placeholder="Optional" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Account</TableHead>
                            <TableHead className="text-center">Type</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {formArray.fields.map((field, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <FormField
                                        name={`items.${index}.chartOfAccountId`}
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        value={String(
                                                            field.value
                                                        )}
                                                    >
                                                        <SelectTrigger className="w-[200px]">
                                                            <SelectValue placeholder="Select a fruit" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>
                                                                    สินทรัพย์
                                                                </SelectLabel>
                                                                {chartOfAccounts
                                                                    .filter(
                                                                        ({
                                                                            type,
                                                                        }) =>
                                                                            type ===
                                                                            'Assets'
                                                                    )
                                                                    .map(
                                                                        (
                                                                            chartOfAccount
                                                                        ) => (
                                                                            <SelectItem
                                                                                value={String(
                                                                                    chartOfAccount.id
                                                                                )}
                                                                                key={
                                                                                    chartOfAccount.id
                                                                                }
                                                                            >
                                                                                {
                                                                                    chartOfAccount.name
                                                                                }
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                                <SelectLabel>
                                                                    หนี้สิน
                                                                </SelectLabel>
                                                                {chartOfAccounts
                                                                    .filter(
                                                                        ({
                                                                            type,
                                                                        }) =>
                                                                            type ===
                                                                            'Liabilities'
                                                                    )
                                                                    .map(
                                                                        (
                                                                            chartOfAccount
                                                                        ) => (
                                                                            <SelectItem
                                                                                value={String(
                                                                                    chartOfAccount.id
                                                                                )}
                                                                                key={
                                                                                    chartOfAccount.id
                                                                                }
                                                                            >
                                                                                {
                                                                                    chartOfAccount.name
                                                                                }
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                                <SelectLabel>
                                                                    ส่วนของผู้ถือหุ้น
                                                                </SelectLabel>
                                                                {chartOfAccounts
                                                                    .filter(
                                                                        ({
                                                                            type,
                                                                        }) =>
                                                                            type ===
                                                                            'Equity'
                                                                    )
                                                                    .map(
                                                                        (
                                                                            chartOfAccount
                                                                        ) => (
                                                                            <SelectItem
                                                                                value={String(
                                                                                    chartOfAccount.id
                                                                                )}
                                                                                key={
                                                                                    chartOfAccount.id
                                                                                }
                                                                            >
                                                                                {
                                                                                    chartOfAccount.name
                                                                                }
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                                <SelectLabel>
                                                                    รายได้
                                                                </SelectLabel>
                                                                {chartOfAccounts
                                                                    .filter(
                                                                        ({
                                                                            type,
                                                                        }) =>
                                                                            type ===
                                                                            'Revenue'
                                                                    )
                                                                    .map(
                                                                        (
                                                                            chartOfAccount
                                                                        ) => (
                                                                            <SelectItem
                                                                                value={String(
                                                                                    chartOfAccount.id
                                                                                )}
                                                                                key={
                                                                                    chartOfAccount.id
                                                                                }
                                                                            >
                                                                                {
                                                                                    chartOfAccount.name
                                                                                }
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                                <SelectLabel>
                                                                    ค่าใช้จ่าย
                                                                </SelectLabel>
                                                                {chartOfAccounts
                                                                    .filter(
                                                                        ({
                                                                            type,
                                                                        }) =>
                                                                            type ===
                                                                            'Expense'
                                                                    )
                                                                    .map(
                                                                        (
                                                                            chartOfAccount
                                                                        ) => (
                                                                            <SelectItem
                                                                                value={String(
                                                                                    chartOfAccount.id
                                                                                )}
                                                                                key={
                                                                                    chartOfAccount.id
                                                                                }
                                                                            >
                                                                                {
                                                                                    chartOfAccount.name
                                                                                }
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormField
                                        name={`items.${index}.type`}
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <ToggleGroup
                                                        value={
                                                            field.value as
                                                                | 'Debit'
                                                                | 'Credit'
                                                        }
                                                        onValueChange={(e) => {
                                                            if (e) {
                                                                field.onChange(
                                                                    e
                                                                )
                                                            }
                                                        }}
                                                        type="single"
                                                        className="grid grid-cols-2 rounded-md border"
                                                    >
                                                        <ToggleGroupItem
                                                            value="Debit"
                                                            aria-label="Debit"
                                                            className="data-[state=on]:bg-primary/10"
                                                        >
                                                            <div>Debit</div>
                                                        </ToggleGroupItem>
                                                        <ToggleGroupItem
                                                            value="Credit"
                                                            aria-label="Credit"
                                                            className="data-[state=on]:bg-primary/10"
                                                        >
                                                            <div>Credit</div>
                                                        </ToggleGroupItem>
                                                    </ToggleGroup>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </TableCell>
                                <TableCell>
                                    {field.type === 'Debit' ? (
                                        <FormField
                                            name={`items.${index}.amount`}
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            onFocus={
                                                                onFocusPreventDefault
                                                            }
                                                            onKeyDown={
                                                                inputNumberPreventDefault
                                                            }
                                                            placeholder="จำนวนเงิน"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ) : (
                                        <Input
                                            disabled
                                            className="disabled:bg-primary/10"
                                        />
                                    )}
                                </TableCell>
                                <TableCell>
                                    {field.type === 'Credit' ? (
                                        <FormField
                                            name={`items.${index}.amount`}
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            onFocus={
                                                                onFocusPreventDefault
                                                            }
                                                            onKeyDown={
                                                                inputNumberPreventDefault
                                                            }
                                                            placeholder="จำนวนเงิน"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ) : (
                                        <Input
                                            disabled
                                            className="disabled:bg-primary/10"
                                        />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Cross1Icon
                                        onClick={() => formArray.remove(index)}
                                        className="text-destructive hover:cursor-pointer"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={4}>
                                <div className="flex w-full justify-center">
                                    <PlusCircledIcon
                                        onClick={() =>
                                            formArray.append({
                                                chartOfAccountId: 0,
                                                type: 'Debit',
                                                amount: 0,
                                            })
                                        }
                                        className="h-6 w-6 hover:cursor-pointer"
                                    />
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <FormMessage>{form.formState.errors.root?.message}</FormMessage>
                <Button type="submit">บันทึก</Button>
            </form>
        </Form>
    )
}
