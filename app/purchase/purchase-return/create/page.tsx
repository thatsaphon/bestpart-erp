import React from 'react'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import Link from 'next/link'
import { Metadata } from 'next'
import CreateOrUpdatePurchaseReturnInvoiceComponent from './create-update-purchase-return-invoice-component'

type Props = {}

export const metadata: Metadata = {
    title: 'สร้างใบลดหนี้/คืนสินค้า',
}

export default async function CreatePurchaseReturnPage({}: Props) {
    // const paymentMethods = await getPaymentMethods()
    return (
        <div className="p-3">
            <h1 className="my-2 text-3xl transition-colors">
                สร้างใบลดหนี้/คืนสินค้า
            </h1>
            <CreateOrUpdatePurchaseReturnInvoiceComponent />
        </div>
    )
}
