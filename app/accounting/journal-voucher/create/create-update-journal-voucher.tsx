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

const formSchema = z.object({
    date: z.date().optional().default(new Date()),
    documentNo: z.string().optional().default(''),
    items: z.array(
        z.object({
            chartOfAccountId: z.number(),
            type: z.enum(['Debit', 'Credit']),
            amount: z.coerce.number(),
        })
    ),
})
type Props = {}

export default function CreateUpdateJournalVoucher({}: Props) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
    })

    const formArray = useFieldArray({ name: 'items', control: form.control })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-[500px] space-y-4 p-2"
            >
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
                <div>
                    <Button type="button" onClick={() => formArray.append({})}>
                        เพิ่ม
                    </Button>
                </div>
                {formArray.fields.map((field, index) => (
                    <div className="flex w-full gap-2" key={index}>
                        <FormField
                            name={`items.${index}.chartOfAccountId`}
                            control={form.control}
                            render={(field) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder="shadcn"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name={`items.${index}.type`}
                            control={form.control}
                            render={(field) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder="shadcn"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name={`items.${index}.amount`}
                            control={form.control}
                            render={(field) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder="shadcn"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                ))}
                {/* <FormField
                    control={form.control}
                    name="items"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /> */}
                <Button type="submit">บันทึก</Button>
            </form>
        </Form>
    )
}
