import React from 'react'
import CreateOrUpdateSalesInvoiceComponent from './create-update-sales-invoice-component'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import Link from 'next/link'
import { Metadata } from 'next'
import { getCustomerOrderDefaultFunction } from '@/types/customer-order/customer-order'

type Props = {
    searchParams: { contactId: number }
}

export const metadata: Metadata = {
    title: 'สร้างบิลขาย',
}

export default async function CreateSalesInvoicePage({
    searchParams: { contactId },
}: Props) {
    const paymentMethods = await getPaymentMethods()

    const customerOrders = await getCustomerOrderDefaultFunction({
        CustomerOrder: {
            contactId: Number(contactId),
            status: {
                notIn: ['Cancelled', 'Closed'],
            },
        },
    })
    console.log(customerOrders)
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
