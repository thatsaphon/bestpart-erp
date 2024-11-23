'use client'

import React, { useActionState, useEffect } from 'react'
import {
    Dialog,
    DialogTrigger,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from './ui/select'
import { z } from 'zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from './ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    createChartOfAccount,
    updateChartOfAccount,
} from '@/actions/create-update-chart-of-account'
import { inputNumberPreventDefault } from '@/lib/input-number-prevent-default'
import toast from 'react-hot-toast'
import { Checkbox } from './ui/checkbox'

type Props = {
    className?: string
    label?: string
}
const formSchema = z.object({
    id: z.coerce.number().min(10000),
    name: z.string().min(1),
    type: z.enum(['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expense']),
    isCash: z.boolean().optional(),
    isAr: z.boolean().optional(),
    isAp: z.boolean().optional(),
    isInputTax: z.boolean().optional(),
    isOutputTax: z.boolean().optional(),
    isDeposit: z.boolean().optional(),
})

export default function ChartOfAccountDialog({
    className,
    label = 'Add',
}: Props) {
    const [open, setOpen] = React.useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        await createChartOfAccount(values)
        toast.success('บันทึกสําเร็จ')
        setOpen(false)
    }
    // const [state, formAction] = useActionState(createChartOfAccounts, {
    //     message: '',
    // })

    // useEffect(() => {
    //     if (state.message === '') return
    //     if (state.message === 'success') {
    //         toast.success('success')
    //         state.message = ''
    //     }
    //     if (state.message !== 'failed') {
    //         toast.error(state.message)
    //         state.message = ''
    //     }
    // }, [state])
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className={className}>
                    {label}
                </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <DialogHeader>
                            <DialogTitle>เพิ่มบัญชี</DialogTitle>
                        </DialogHeader>
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="mb-3">
                                        ประเภท
                                    </FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Assets">
                                                    Assets
                                                </SelectItem>
                                                <SelectItem value="Liabilities">
                                                    Liabilities
                                                </SelectItem>
                                                <SelectItem value="Equity">
                                                    Equity
                                                </SelectItem>
                                                <SelectItem value="Revenue">
                                                    Revenue
                                                </SelectItem>
                                                <SelectItem value="Expense">
                                                    Expense
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>รหัสบัญชี</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="รหัสบัญชี"
                                            type="number"
                                            onKeyDown={
                                                inputNumberPreventDefault
                                            }
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ชื่อบัญชี</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="ชื่อบัญชี"
                                            type="text"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            {(
                                [
                                    {
                                        name: 'isCash',
                                        label: 'เงินสด',
                                    },
                                    {
                                        name: 'isAr',
                                        label: 'ลูกหนี้',
                                    },
                                    {
                                        name: 'isAp',
                                        label: 'เจ้าหนี้',
                                    },
                                    {
                                        name: 'isInputTax',
                                        label: 'ภาษีซื้อ',
                                    },
                                    {
                                        name: 'isOutputTax',
                                        label: 'ภาษีขาย',
                                    },
                                    {
                                        name: 'isDeposit',
                                        label: 'มัดจำ',
                                    },
                                ] as const
                            ).map(({ name, label }) => (
                                <FormField
                                    key={name}
                                    control={form.control}
                                    name={name}
                                    render={({ field }) => (
                                        <FormItem className="flex items-end gap-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <FormLabel>{label}</FormLabel>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="submit">Submit</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
