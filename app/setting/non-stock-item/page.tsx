import prisma from '@/app/db/db'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import {
    Table,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import AddUpdateNonStockItemDialog from './add-update-non-stock-item-dialog'
import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Props = {}

export default async function NonStockSettingPage({}: Props) {
    const items = await prisma.serviceAndNonStockItem.findMany({
        include: {
            ChartOfAccount: true,
        },
    })
    const chartOfAccount = await prisma.chartOfAccount.findMany({
        where: {
            isAp: false,
            isAr: false,
            isCash: false,
            isDeposit: false,
            isInputTax: false,
            isOutputTax: false,
        },
        orderBy: { id: 'asc' },
    })
    return (
        <div className="p-3">
            <h1 className="flex items-center gap-3 text-3xl">
                <span>ตั้งค่า ค่าบริการหรือรายการที่ไม่ใช้สินค้า</span>
                <AddUpdateNonStockItemDialog chartOfAccount={chartOfAccount} />
            </h1>
            <div className="my-3"></div>
            <Separator />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>ชื่อ</TableHead>
                        <TableHead>ชื่อบัญชี</TableHead>
                        <TableHead className="text-center">ขายได้</TableHead>
                        <TableHead className="text-center">ซื้อได้</TableHead>
                        <TableHead className="text-center">
                            ซื้อในรายได้อื่นได้
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{item.name}</span>
                                    {item.isDiscount && (
                                        <Badge
                                            variant={'outline'}
                                            className="font-medium"
                                        >
                                            ส่วนลด
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{item.ChartOfAccount.name}</TableCell>
                            <TableCell className="text-center">
                                {item.canSales && <Check className="inline" />}
                            </TableCell>
                            <TableCell className="text-center">
                                {item.canPurchase && (
                                    <Check className="inline" />
                                )}
                            </TableCell>
                            <TableCell className="text-center">
                                {item.canOtherInvoice && (
                                    <Check className="inline" />
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
