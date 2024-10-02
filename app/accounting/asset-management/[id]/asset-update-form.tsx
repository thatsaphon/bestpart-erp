'use client'

import React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Asset, AssetType } from '@prisma/client'
import { typedObjectKeys } from '@/lib/zod-helper'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectLabel,
    SelectItem,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DatePickerWithPresets } from '@/components/date-picker-preset'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { updateAsset } from './update-asset'
import toast from 'react-hot-toast'
import {
    inputNumberPreventDefault,
    onFocusPreventDefault,
} from '@/lib/input-number-prevent-default'
import DateFormfield from '@/components/date-formfield'

const [firstKey, ...otherKeys] = typedObjectKeys(AssetType)

const formSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    type: z.enum([firstKey!, ...otherKeys]),
    acquisitionDate: z.date(),
    usefulLife: z.coerce.number().int().optional(),
    cost: z.coerce.number().optional(),
    residualValue: z.coerce.number().optional(),
    remark: z.string(),
    isWriteOff: z.boolean().optional(),
})

type Props = {
    asset: Asset
}

export default function AssetUpdateForm({ asset }: Props) {
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...asset,
            usefulLife: asset.usefulLife ?? undefined,
        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
        await updateAsset(asset.id, values)
        toast.success('บันทึกสําเร็จ')
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="my-3 w-[500px] space-y-3"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>ชื่อ</FormLabel>
                            <FormControl>
                                <Input placeholder="ชื่อ" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>รายละเอียด</FormLabel>
                            <FormControl>
                                <Input placeholder="รายละเอียด" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>ประเภท</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกประเภทค่าใช้จ่าย" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>ประเภท</SelectLabel>
                                            {Object.entries(AssetType).map(
                                                ([key, value]) => (
                                                    <SelectItem
                                                        key={key}
                                                        value={key}
                                                    >
                                                        {key.replaceAll(
                                                            '_',
                                                            ' '
                                                        )}
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
                <DateFormfield
                    formControl={form.control}
                    name="acquisitionDate"
                    label="Acquisition Date"
                />
                <FormField
                    control={form.control}
                    name="usefulLife"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>อายุการใช้งาน</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    onKeyDown={inputNumberPreventDefault}
                                    onFocus={onFocusPreventDefault}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>ต้นทุน</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    onKeyDown={inputNumberPreventDefault}
                                    onFocus={onFocusPreventDefault}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="residualValue"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>มูลค่าลดลง</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    onKeyDown={inputNumberPreventDefault}
                                    onFocus={onFocusPreventDefault}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="remark"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>หมายเหตุ</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}
