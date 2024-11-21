'use client'

import DateFormfield from '@/components/date-formfield'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    inputNumberPreventDefault,
    onFocusPreventDefault,
} from '@/lib/input-number-prevent-default'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircleIcon } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { addAssetMovement } from './add-asset-movement'

const formSchema = z.object({
    date: z.date(),
    documentNo: z.string(),
    value: z.coerce.number(),
    description: z.string().optional(),
})

type Props = {
    assetId: number
}

export default function AddAssetMovementDialog({ assetId }: Props) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            documentNo: '',
            value: undefined,
            date: undefined,
            description: undefined,
        },
    })
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log(values)
        await addAssetMovement(assetId, values)
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button">เพิ่ม</Button>
            </DialogTrigger>
            <DialogContent className="w-auto max-w-[90vw]">
                <DialogHeader>
                    <DialogTitle>เพิ่มการเคลื่อนไหวของสินทรัพย์</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="my-3 w-[500px] space-y-3"
                    >
                        <DateFormfield name="date" label="วันที่" />
                        <FormField
                            control={form.control}
                            name="documentNo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>เลขที่เอกสาร</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="เลขที่เอกสาร"
                                            {...field}
                                        />
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
                                        <Input
                                            type="text"
                                            placeholder="รายละเอียด"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>มูลค่า</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="มูลค่า"
                                            {...field}
                                            onFocus={onFocusPreventDefault}
                                            onKeyDown={
                                                inputNumberPreventDefault
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="mt-3">
                            <Button type="submit">ยืนยัน</Button>
                            <DialogClose asChild>
                                <Button variant={'outline'} type="button">
                                    ยกเลิก
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
