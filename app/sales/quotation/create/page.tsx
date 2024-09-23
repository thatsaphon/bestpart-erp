import React from 'react'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import Link from 'next/link'
import { Metadata } from 'next'
import CreateOrUpdateQuotationComponent from './create-update-quotation-component'

type Props = {}

export const metadata: Metadata = {
    title: 'สร้างใบเสนอราคา',
}

export default async function CreateQuotationPage({}: Props) {
    // const paymentMethods = await getPaymentMethods()
    return (
        <>
            <h1 className="my-2 text-3xl transition-colors">สร้างใบเสนอราคา</h1>
            <CreateOrUpdateQuotationComponent />
        </>
    )
}
