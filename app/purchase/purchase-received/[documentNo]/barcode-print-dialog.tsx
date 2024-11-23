'use client'

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import React from 'react'
import BarcodePrintLink from './barcode-print-link'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { DocumentItem } from '@/types/document-item'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { PrintBarcode, printBarcodeSchema } from '@/types/barcode/print-barcode'
import { Input } from '@/components/ui/input'
import { inputNumberPreventDefault } from '@/lib/input-number-prevent-default'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

type Props = {
    items: DocumentItem[]
}

export default function BarcodePrintDialog({ items }: Props) {
    const [key, setKey] = React.useState('0')
    const form = useForm<z.infer<typeof printBarcodeSchema>>({
        resolver: zodResolver(printBarcodeSchema),
        defaultValues: {
            items: items
                .filter((i) => i.barcode)
                .map((i) => ({
                    partNumber: i.partNumber || '',
                    name: i.name,
                    detail: i.detail,
                    barcode: i.barcode || '',
                    quantity: i.quantity,
                    priceCode: '',
                })),
        },
    })
    const formArray = useFieldArray({ name: 'items', control: form.control })
    const [barcodeItems, setBarcodeItems] = React.useState<PrintBarcode>([])

    function onSubmit(values: z.infer<typeof printBarcodeSchema>) {
        setBarcodeItems(values.items)
        setKey(window.crypto.randomUUID())
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button">Barocde</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[80vw]">
                <DialogTitle></DialogTitle>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Part-Number</TableHead>
                                    <TableHead>ชื่อ</TableHead>
                                    <TableHead>รายละเอียด</TableHead>
                                    <TableHead>Barcode</TableHead>
                                    <TableHead>รหัสลับ</TableHead>
                                    <TableHead>จำนวน</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formArray.fields.map((field, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.partNumber`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.detail`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.barcode`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.priceCode`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                onKeyDown={
                                                                    inputNumberPreventDefault
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Button type="submit">Generate</Button>
                    </form>
                </Form>
                <div>
                    <BarcodePrintLink key={key} items={barcodeItems} />
                </div>
            </DialogContent>
        </Dialog>
    )
}
