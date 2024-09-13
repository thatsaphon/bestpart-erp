import Link from 'next/link'
import React from 'react'
import CreateUpdatePaymentComponent from './create-update-payment-component'

type Props = {}

export default function page({}: Props) {
    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/accounting/payment`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">New Payment</h1>
            <CreateUpdatePaymentComponent />
        </>
    )
}
