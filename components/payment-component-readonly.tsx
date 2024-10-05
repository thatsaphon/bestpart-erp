import { Payment } from '@/types/payment/payment'
import { Fragment } from 'react'
import { Input } from './ui/input'

type Props = {
    payments: Payment[]
}

export default function PaymentComponentReadonly({ payments }: Props) {
    return (
        <div className="grid grid-cols-[1fr_100px_100px] items-baseline gap-x-5">
            <p className="justify-self-end">วิธีการชำระเงิน: </p>
            {payments.map((payment, index) => (
                <Fragment key={index}>
                    <span className="col-start-2">{payment.name}</span>
                    <div className="flex items-baseline gap-2">
                        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-right text-sm">
                            {payment.amount.toLocaleString()}
                        </div>
                    </div>
                </Fragment>
            ))}
        </div>
    )
}
