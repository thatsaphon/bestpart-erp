'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTrigger,
    DialogTitle,
} from '@/components/ui/dialog'
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
import React from 'react'
import toast from 'react-hot-toast'
import { receivedFromBill } from './received-from-bill'

type Props = {
    bankAccounts?: ChartOfAccount[]
    billAmount: number
    documentNo: string
}

export default function ReceivedDialog({
    bankAccounts = [
        {
            id: 11000,
            name: 'เงินสด',
            type: 'Assets',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ],
    billAmount,
    documentNo,
}: Props) {
    const [date, setDate] = React.useState(new Date())
    const [payAmount, setPayAmount] = React.useState(0)
    const [isOpen, setIsOpen] = React.useState(false)
    const [selectedBankAccount, setSelectedBankAccount] =
        React.useState<string>('')

    const [remark, setRemark] = React.useState('')
    const [handleDifference, setHandleDifference] = React.useState<
        'outstanding' | 'discount' | ''
    >('')

    const createReceivedFromBill = async () => {
        if (payAmount !== billAmount && !handleDifference) {
            toast.error('กรุณาเลือกวิธีจัดการกับส่วนต่าง')
            return
        }
        try {
            await receivedFromBill(
                documentNo,
                date,
                payAmount,
                selectedBankAccount,
                remark,
                handleDifference || undefined
            )
            toast.success('บันทึกสําเร็จ')
            setIsOpen(false)
        } catch (err) {
            if (err instanceof Error) {
                return toast.error(err.message)
            }
            return toast.error('Something went wrong')
        }
    }
    return (
        <form action={createReceivedFromBill}>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <div className="flex items-center justify-center gap-2">
                    <span>รับเงิน:</span>
                    <Input
                        type="date"
                        className="w-[180px]"
                        name="date"
                        onChange={(e) => setDate(new Date(e.target.value))}
                        value={date.toISOString().substring(0, 10)}
                    />
                    <Select
                        name="bank"
                        onValueChange={setSelectedBankAccount}
                        value={selectedBankAccount}
                    >
                        <SelectTrigger className="w-auto min-w-[300px]">
                            <SelectValue placeholder="Select a Bank Account" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Bank Account</SelectLabel>
                                {bankAccounts.map((item) => (
                                    <SelectItem
                                        key={item.id}
                                        value={String(item.id)}
                                    >
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Input
                        className="w-auto"
                        placeholder="จำนวนเงิน"
                        value={payAmount}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
                        type="number"
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                e.preventDefault()
                            }
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                if (payAmount === 0) {
                                    toast.error('กรุณาระบุจำนวนเงิน')
                                    return
                                }
                                if (!selectedBankAccount) {
                                    toast.error('กรุณาเลือกบัญชีที่รับชำระ')
                                    return
                                }

                                setIsOpen(true)
                            }
                        }}
                    />
                    <Button
                        variant={'outline'}
                        type="button"
                        onClick={() => {
                            if (payAmount === 0) {
                                toast.error('กรุณาระบุจำนวนเงิน')
                                return
                            }
                            if (!selectedBankAccount) {
                                toast.error('กรุณาเลือกบัญชีที่รับชำระ')
                                return
                            }

                            setIsOpen(true)
                        }}
                    >
                        ยืนยัน
                    </Button>
                    {/* <DialogTrigger asChild>
                    </DialogTrigger> */}
                </div>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>ยืนยันการชำระเงิน</DialogTitle>
                        <DialogDescription>{documentNo}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <span>จำนวนเงินทั้งหมด: {billAmount}</span>
                        <span>จำนวนเงินที่รับ: {payAmount}</span>
                        <span className="text-primary/50">
                            {
                                bankAccounts.find(
                                    (item) => item.id === +selectedBankAccount
                                )?.name
                            }
                        </span>
                        <span>จำนวนเงินคงเหลือ: {billAmount - payAmount}</span>
                        {billAmount - payAmount !== 0 && (
                            <Select
                                name="difference"
                                onValueChange={(
                                    value: 'outstanding' | 'discount'
                                ) => setHandleDifference(value)}
                                value={handleDifference}
                            >
                                <SelectTrigger className="w-auto min-w-[300px]">
                                    <SelectValue placeholder="จัดการกับส่วนต่าง" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>
                                            จัดการกับส่วนต่าง
                                        </SelectLabel>
                                        <SelectItem value={'outstanding'}>
                                            ยอดคงค้าง
                                        </SelectItem>
                                        <SelectItem value={'discount'}>
                                            ปรับเป็นส่วนลด
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="mr-2">หมายเหตุ</p>
                        <Input name="remark" className="w-full" />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                ยกเลิก
                            </Button>
                        </DialogClose>
                        <Button
                            variant={'default'}
                            autoFocus
                            onClick={createReceivedFromBill}
                        >
                            ยืนยัน
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </form>
    )
}
