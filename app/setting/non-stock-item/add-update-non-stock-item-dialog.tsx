'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ChartOfAccount } from '@prisma/client'
import { Checkbox } from '@/components/ui/checkbox'
import { createNonStockItem } from './create-non-stock-item'
import toast from 'react-hot-toast'

type Props = {
    chartOfAccount: ChartOfAccount[]
}

export default function AddUpdateNonStockItemDialog({ chartOfAccount }: Props) {
    const [open, setOpen] = React.useState(false)
    const [name, setName] = React.useState('')
    const [chartOfAccountValue, setChartOfAccountValue] = React.useState('')
    const [canOtherInvoice, setCanOtherInvoice] = React.useState(false)
    const [canPurchase, setCanPurchase] = React.useState(false)
    const [canSales, setCanSales] = React.useState(false)

    const onSubmit = async () => {
        try {
            await createNonStockItem({
                name,
                ChartOfAccount: {
                    connect: {
                        id: Number(chartOfAccountValue),
                    },
                },
                canOtherInvoice,
                canPurchase,
                canSales,
            })
            toast.success('บันทึกสําเร็จ')
            setOpen(false)
            setName('')
            setChartOfAccountValue('')
            setCanOtherInvoice(false)
            setCanPurchase(false)
            setCanSales(false)
        } catch (err) {
            if (err instanceof Error) return toast.error(err.message)
            toast.error('Something went wrong')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={'outline'} type="button">
                    สร้างใหม่
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>สร้างรายการที่ไม่ใช่สินค้าใหม่</DialogTitle>
                </DialogHeader>
                <div>
                    <form className="space-y-4" action={onSubmit}>
                        <Label className="flex flex-col space-y-1">
                            <span className="text-sm font-medium">ชื่อ</span>
                            <Input
                                type="text"
                                className="input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Label>
                        <Label className="flex flex-col space-y-1">
                            <span className="text-sm font-medium">บัญชี</span>
                            <Select
                                value={chartOfAccountValue}
                                onValueChange={setChartOfAccountValue}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="เลือกบัญชี" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>เลือกบัญชี</SelectLabel>
                                        {chartOfAccount.map((chart) => (
                                            <SelectItem
                                                value={String(chart.id)}
                                                key={chart.id}
                                            >
                                                {`${chart.id} - ${chart.name}`}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {/* <select className="select">
                                <option value="">เลือกบัญชี</option>
                            </select> */}
                        </Label>
                        <div className="flex space-x-2">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="canSales"
                                    checked={canSales}
                                    onCheckedChange={(e) =>
                                        typeof e === 'boolean' && setCanSales(e)
                                    }
                                />
                                <Label htmlFor="canSales">ขายได้</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="canPurchase"
                                    checked={canPurchase}
                                    onCheckedChange={(e) =>
                                        typeof e === 'boolean' &&
                                        setCanPurchase(e)
                                    }
                                />
                                <Label htmlFor="canPurchase">ซื้อได้</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="canOtherInvoice"
                                    checked={canOtherInvoice}
                                    onCheckedChange={(e) =>
                                        typeof e === 'boolean' &&
                                        setCanOtherInvoice(e)
                                    }
                                />
                                <Label htmlFor="canOtherInvoice">
                                    ใบเสร็จอื่น
                                </Label>
                            </div>
                        </div>
                    </form>
                </div>
                <DialogFooter>
                    <Button onClick={onSubmit}>ยืนยัน</Button>
                    <DialogClose asChild>
                        <Button variant={'outline'}>ยกเลิก</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
