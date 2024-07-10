import React from 'react'
import { TableCaption } from '../ui/table'
import { getPaymentMethods } from '@/app/actions/accounting'
import { DocumentRemark, PaymentStatus } from '@prisma/client'
import { Badge } from '../ui/badge'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Cross1Icon } from '@radix-ui/react-icons'
import toast from 'react-hot-toast'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

type Props = {
    defaultDocumentDetails?: {
        id: number
        date: Date
        documentNo: string
        contactId: number
        contactName: string
        address: string
        phone: string
        taxId: string
        documentRemarks: DocumentRemark[]
        paymentStatus: PaymentStatus
    }
    paymentMethods: Awaited<ReturnType<typeof getPaymentMethods>>
    defaultPayments?: { id: number; amount: number }[]
    defaultRemarks?: { id: number; remark: string; isDeleted?: boolean }[]
    remarks: { id?: number; remark: string; isDeleted?: boolean }[]
    setRemarks: React.Dispatch<
        React.SetStateAction<
            { id?: number; remark: string; isDeleted?: boolean }[]
        >
    >
    selectedPayments: { id: number; amount: number }[]
    setSelectedPayments: React.Dispatch<
        React.SetStateAction<{ id: number; amount: number }[]>
    >
}

export default function PaymentRemark({
    defaultDocumentDetails,
    paymentMethods,
    defaultPayments,
    defaultRemarks,
    selectedPayments,
    setSelectedPayments,
}: Props) {
    const [remarks, setRemarks] = React.useState<
        { id?: number; remark: string; isDeleted?: boolean }[]
    >(defaultRemarks || [])
    const [remarkInput, setRemarkInput] = React.useState<string>('')
    const [selectedPayment, setSelectedPayment] = React.useState<
        number | undefined
    >()
    const [paymentAmount, setPaymentAmount] = React.useState<
        number | undefined
    >()

    const addRemark = () => {
        if (!remarkInput) return
        setRemarks((prev) => [...prev, { remark: remarkInput }])
        setRemarkInput('')
    }

    const removeRemark = (index: number) => {
        // setRemarks((prev) => prev.filter((_, i) => i !== index))
        const remarkToRemove = remarks[index]
        if (remarkToRemove.id) {
            setRemarks((prev) =>
                prev.map((remark) =>
                    remark.id === remarkToRemove.id
                        ? { ...remark, isDeleted: true }
                        : remark
                )
            )
        } else {
            setRemarks((prev) => prev.filter((_, i) => i !== index))
        }
    }

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

    return (
        <TableCaption>
            <div className="w-[650px] space-y-1">
                <div className="flex items-center gap-1 text-left">
                    ช่องทางชำระเงิน:{' '}
                    {!defaultDocumentDetails ? (
                        <></>
                    ) : defaultDocumentDetails?.paymentStatus === 'Paid' ? (
                        <Badge className="bg-green-400">จ่ายแล้ว</Badge>
                    ) : defaultDocumentDetails?.paymentStatus === 'Billed' ? (
                        <Badge variant={`secondary`}>วางบิลแล้ว</Badge>
                    ) : defaultDocumentDetails?.paymentStatus ===
                      'PartialPaid' ? (
                        <Badge variant={'destructive'}>จ่ายบางส่วน</Badge>
                    ) : !defaultDocumentDetails?.paymentStatus ? (
                        <Badge className="bg-green-400">เงินสด</Badge>
                    ) : (
                        <Badge variant={'destructive'}>ยังไม่จ่าย</Badge>
                    )}
                </div>
                {selectedPayments.map((item) => (
                    <div
                        key={item.id}
                        className={cn(
                            'grid grid-cols-[1fr_1fr_140px] items-center gap-1 text-primary',
                            defaultDocumentDetails?.paymentStatus ===
                                'Billed' && 'grid-cols-2'
                        )}
                    >
                        <p>
                            {paymentMethods.find((p) => p.id === item.id)
                                ?.id === 12000
                                ? 'เงินเชื่อ'
                                : paymentMethods.find((p) => p.id === item.id)
                                      ?.name}
                        </p>
                        <p>{item.amount}</p>
                        <Cross1Icon
                            className={cn(
                                'cursor-pointer text-destructive',
                                defaultDocumentDetails?.paymentStatus ===
                                    'Billed' && 'hidden'
                            )}
                            onClick={() =>
                                setSelectedPayments(
                                    selectedPayments.filter(
                                        (p) => p.id !== item.id
                                    )
                                )
                            }
                        />
                    </div>
                ))}
                <div
                    className={cn(
                        'grid grid-cols-[1fr_1fr_140px] items-center gap-1',
                        defaultDocumentDetails?.paymentStatus === 'Billed' &&
                            'hidden'
                    )}
                >
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
                        onChange={(e) =>
                            setPaymentAmount(Number(e.target.value))
                        }
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
                {defaultDocumentDetails?.paymentStatus === 'Billed' && (
                    <p className="text-destructive">วางบิลแล้ว</p>
                )}

                <p className="text-left">หมายเหตุ:</p>
                {remarks.map((remark, index) => (
                    <p
                        className={cn(
                            'grid grid-cols-[1fr_20px] items-center gap-1 text-left text-primary',
                            remark.isDeleted && 'text-primary/50 line-through'
                        )}
                        key={'remark-' + index}
                    >
                        <span>{remark.remark}</span>
                        <Cross1Icon
                            className={cn(
                                'font-bold text-destructive hover:cursor-pointer',
                                remark.isDeleted && 'hidden'
                            )}
                            onClick={() => removeRemark(index)}
                        />
                    </p>
                ))}
                <div className="grid grid-cols-[1fr_140px] items-center gap-1">
                    <Input
                        name="remark"
                        onChange={(e) => setRemarkInput(e.target.value)}
                        value={remarkInput}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                addRemark()
                            }
                        }}
                    />
                    <Button type="button" onClick={() => addRemark()}>
                        เพิ่มหมายเหตุ
                    </Button>
                </div>
            </div>
            <div className="mt-4 flex w-[600px] justify-end gap-1">
                {/* <Button
                    variant="destructive"
                    type="button"
                    onClick={(e) => {
                        setKey(String(Date.now()))
                        setItems(defaultItems)
                    }}
                >
                    Reset
                </Button> */}
                <Button type="submit">Save</Button>
            </div>
        </TableCaption>
    )
}
