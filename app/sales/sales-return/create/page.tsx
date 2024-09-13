import React from 'react'
// import CreateOrUpdateSalesInvoiceComponent from './create-update-sales-invoice-component'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import Link from 'next/link'
// import CreateOrUpdateSalesReturnInvoiceComponent from './create-update-sales-return-invoice-component'
import { Metadata } from 'next'
import CreateOrUpdateSalesReturnInvoiceComponent from './create-update-sales-return-invoice-component'

type Props = {}

export const metadata: Metadata = {
    title: 'สร้างใบรับคืนสินค้า',
}

export default async function CreateSalesInvoicePage({}: Props) {
    const paymentMethods = await getPaymentMethods()
    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/sales/sales-return`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">
                สร้างใบรับคืนสินค้า
            </h1>
            <CreateOrUpdateSalesReturnInvoiceComponent
                paymentMethods={paymentMethods}
            />
        </>
    )
}
