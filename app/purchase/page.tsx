import {
    Table,
    TableCaption,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table'
import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button'

type Props = {}

export default function PurchasePage({}: Props) {
    return (
        <div className="mb-2 p-3">
            <h1 className="flex items-center gap-2 text-3xl text-primary">
                <span>งานซื้อสินค้า</span>
                <Link href={'/purchase/create'}>
                    <Button className="ml-3" variant={'outline'}>
                        สร้างบิลซื้อ
                    </Button>
                </Link>
            </h1>
            <Table>
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Invoice</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">INV001</TableCell>
                        <TableCell>Paid</TableCell>
                        <TableCell>Credit Card</TableCell>
                        <TableCell className="text-right">$250.00</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}
