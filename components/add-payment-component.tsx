import { getPaymentMethods } from '@/actions/get-payment-methods'
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
import { Cross1Icon } from '@radix-ui/react-icons'
import { inputNumberPreventDefault } from '@/lib/input-number-prevent-default'

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
    depositAmount = 0,
}: Props) {
    const addDefaultPayment = () => {
        setPayments([
            ...payments,
            {
                chartOfAccountId: paymentMethods.find((c) => c.isCash)?.id || 0,
                amount: 0,
            },
        ])
    }
    return (
        <div className="grid w-full grid-cols-[1fr_300px_1fr] items-baseline gap-x-5 p-3">
            <div className="justify-self-end">เลือกวิธีการชําระเงิน</div>
            {payments.map((payment, index) => (
                <Fragment key={index}>
                    <Select
                        value={String(payment.chartOfAccountId)}
                        onValueChange={(value) =>
                            setPayments([
                                ...payments.map((p, i) =>
                                    i === index
                                        ? {
                                              ...p,
                                              chartOfAccountId: Number(value),
                                          }
                                        : p
                                ),
                            ])
                        }
                    >
                        <SelectTrigger className="col-start-2 w-[250px] justify-self-end">
                            <SelectValue placeholder="เลือกวิธีการชําระเงิน" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>เลือกวิธีการชําระเงิน</SelectLabel>
                                {paymentMethods.map((paymentMethod) => (
                                    <SelectItem
                                        key={paymentMethod.id}
                                        value={String(paymentMethod.id)}
                                    >
                                        {paymentMethod.name}{' '}
                                        {paymentMethod.isDeposit && (
                                            <span className="text-primary/50">
                                                ({depositAmount})
                                            </span>
                                        )}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <div className="flex items-baseline gap-2">
                        <Input
                            type="number"
                            className="justify-self-start"
                            value={payment.amount}
                            onKeyDown={inputNumberPreventDefault}
                            onChange={(e) =>
                                setPayments([
                                    ...payments.map((p, i) =>
                                        i === index
                                            ? {
                                                  ...p,
                                                  amount: Number(
                                                      e.target.value
                                                  ),
                                              }
                                            : p
                                    ),
                                ])
                            }
                        />
                        <Cross1Icon
                            className="text-destructive hover:cursor-pointer"
                            onClick={() =>
                                setPayments([
                                    ...payments.filter((p, i) => i !== index),
                                ])
                            }
                        />
                    </div>
                </Fragment>
            ))}
            <PlusCircleIcon
                className="col-span-2 col-start-2 mt-1 justify-self-center text-primary/50 hover:cursor-pointer hover:text-primary"
                onClick={addDefaultPayment}
            />
        </div>
    )
}
