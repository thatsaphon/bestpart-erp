import React from 'react'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import Link from 'next/link'
import { Metadata } from 'next'
import CreateOrUpdateCustomerOrderComponent from './create-update-customer-order-component'

type Props = {}

export const metadata: Metadata = {
    title: 'สร้างใบจองสินค้า',
}

export default async function CreateCustomerOrderPage({}: Props) {
    const paymentMethods = await getPaymentMethods()
    return (
        <>
            <h1 className="my-2 text-3xl transition-colors">
                สร้างใบจองสินค้า
            </h1>
            <CreateOrUpdateCustomerOrderComponent
                paymentMethods={paymentMethods}
            />
        </>
    )
}
