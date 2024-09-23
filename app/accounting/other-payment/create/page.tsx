import Link from 'next/link'
import React from 'react'
import CreateUpdatePaymentComponent from './create-update-payment-component'

type Props = {}

export default function page({}: Props) {
    return (
        <>
            <h1 className="my-2 text-3xl transition-colors">New Payment</h1>
            <CreateUpdatePaymentComponent />
        </>
    )
}
