'use client'

import { getPaymentMethods } from '@/app/actions/accounting'
import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Cross1Icon } from '@radix-ui/react-icons'
import { Input } from '@/components/ui/input'
import React from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { updateSalesInvoice } from '../create/update-sales-invoice'
import { updatePayments } from './update-payments'

type Props = {
    paymentMethods: Awaited<ReturnType<typeof getPaymentMethods>>
    document: Awaited<ReturnType<typeof getSalesInvoiceDetail>>
}

export default function EditPaymentsComponents({
    paymentMethods,
    document,
}: Props) {
    const [selectedPayments, setSelectedPayments] = React.useState<
        { id: number; amount: number }[]
    >(
        document?.GeneralLedger.filter(
            ({ chartOfAccountId }) =>
                chartOfAccountId <= 12000 && chartOfAccountId >= 11000
        ).map(({ chartOfAccountId, amount }) => ({
            id: chartOfAccountId,
            amount,
        })) || []
    )
    const [selectedPayment, setSelectedPayment] = React.useState<
        number | undefined
    >()
    const [paymentAmount, setPaymentAmount] = React.useState<
        number | undefined
    >()

    const addPayment = () => {
        if (!selectedPayment || !paymentAmount) {
            toast.error('กรุณาเลือกช่องทางการชําระเงินหรือจำนวนเงิน')
            return
        }
        setSelectedPayments((prev) => [
            ...prev,
            { id: selectedPayment, amount: paymentAmount },
        ])
        setSelectedPayment(undefined)
        setPaymentAmount(undefined)
    }

    const submitPayment = async () => {
        const totalBill = Math.abs(
            Number(
                document?.GeneralLedger.filter(
                    (item) =>
                        item.chartOfAccountId >= 11000 &&
                        item.chartOfAccountId <= 12000
                )?.reduce((a, b) => a + b.amount, 0)
            )
        )
        if (totalBill < selectedPayments.reduce((a, b) => a + b.amount, 0)) {
            toast.error('จำนวนเงินที่ชำระเงินไม่ถูกต้อง')
            return
        }
        if (document) {
            try {
                await updatePayments(document.id, selectedPayments)
                toast.success('แก้ไขการชำระเงินสำเร็จ')
            } catch (err) {
                if (err instanceof Error) return toast.error(err.message)
                toast.error('Something went wrong')
            }
        }
    }

    return (
        <>
            <p className="text-left">ช่องทางชำระเงิน: </p>
            {selectedPayments.map((item) => (
                <div
                    key={item.id}
                    className="grid grid-cols-[1fr_1fr_140px] items-center gap-1 text-primary"
                >
                    <p>
                        {paymentMethods.find((p) => p.id === item.id)?.id ===
                        12000
                            ? 'เงินเชื่อ'
                            : paymentMethods.find((p) => p.id === item.id)
                                  ?.name}
                    </p>
                    <p>{item.amount}</p>
                    <Cross1Icon
                        className="cursor-pointer text-destructive"
                        onClick={() =>
                            setSelectedPayments(
                                selectedPayments.filter((p) => p.id !== item.id)
                            )
                        }
                    />
                </div>
            ))}
            <div className="grid grid-cols-[1fr_1fr_140px] items-center gap-1">
                <Select
                    name="paymentMethodId"
                    onValueChange={(e) => setSelectedPayment(Number(e))}
                    value={String(selectedPayment)}
                >
                    <SelectTrigger className="">
                        <SelectValue placeholder={'เลือกช่องทางชำระเงิน'} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>ช่องทางชำระเงิน</SelectLabel>
                            {paymentMethods
                                .filter(
                                    ({ id }) =>
                                        !selectedPayments.find(
                                            (p) => p.id === id
                                        )
                                )
                                .map((item) => (
                                    <SelectItem
                                        key={item.id}
                                        value={String(item.id)}
                                    >
                                        {item.id === 12000
                                            ? 'เงินเชื่อ'
                                            : item.name}
                                    </SelectItem>
                                ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Input
                    name="amount"
                    type="number"
                    placeholder="จำนวนเงิน"
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    value={paymentAmount || ''}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            addPayment()
                        }
                    }}
                />
                <Button type="button" onClick={() => addPayment()}>
                    เพิ่มการชำระเงิน
                </Button>
            </div>
            <Button onClick={() => submitPayment()}>ยืนยัน</Button>
        </>
    )
}
