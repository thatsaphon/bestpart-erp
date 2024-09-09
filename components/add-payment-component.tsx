import { getPaymentMethods } from '@/app/actions/accounting'
import { Payment } from '@/types/payment/payment'
import { PlusCircleIcon } from 'lucide-react'
import React, { Fragment } from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from './ui/input'

type Props = {
    paymentMethods: Awaited<ReturnType<typeof getPaymentMethods>>
    payments: Payment[]
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>
    depositAmount?: number
}

export default function AddPaymentComponent({
    paymentMethods,
    payments,
    setPayments,
    depositAmount,
}: Props) {
    const addDefaultPayment = () => {
        setPayments([
            ...payments,
            {
                chartOfAccountId:
                    paymentMethods.find((c) => c.isCash)?.id || 11000,
                amount: 0,
                name: paymentMethods.find((c) => c.isCash)?.name || 'เงินสด',
            },
        ])
    }
    return (
        <div className="grid w-full grid-cols-[1fr_300px_1fr] items-baseline gap-x-5 p-3">
            <div className="justify-self-end">เลือกวิธีการชําระเงิน</div>
            {payments.map((payment, index) => (
                <Fragment key={index}>
                    <Select onValueChange={() => setPayments([...payments])}>
                        <SelectTrigger className="col-start-2 w-[250px] justify-self-end">
                            <SelectValue placeholder="Select a fruit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Fruits</SelectLabel>
                                <SelectItem value="apple">Apple</SelectItem>
                                <SelectItem value="banana">Banana</SelectItem>
                                <SelectItem value="blueberry">
                                    Blueberry
                                </SelectItem>
                                <SelectItem value="grapes">Grapes</SelectItem>
                                <SelectItem value="pineapple">
                                    Pineapple
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Input type="number" className="justify-self-start" />
                </Fragment>
            ))}
            <PlusCircleIcon
                className="col-span-2 col-start-2 justify-self-center text-primary/50 hover:cursor-pointer hover:text-primary"
                onClick={addDefaultPayment}
            />
            {/* <div className="col-span-2 just">
            </div> */}
        </div>
    )
}
