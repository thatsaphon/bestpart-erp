import React from 'react'
import CreateOrUpdateSalesInvoiceComponent from './create-update-sales-invoice-component'
import { getPaymentMethods } from '@/app/actions/accounting'
import Link from 'next/link'
import { Metadata } from 'next'

type Props = {}

export const metadata: Metadata = {
    title: 'สร้างบิลขาย',
}

export default async function CreateSalesInvoicePage({}: Props) {
    const paymentMethods = await getPaymentMethods()
    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/sales/sales-order`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">สร้างบิลขาย</h1>
            <CreateOrUpdateSalesInvoiceComponent
                paymentMethods={paymentMethods}
            />
        </>
    )
}
