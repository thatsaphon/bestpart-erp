import Link from 'next/link'
import React from 'react'
import CreateUpdateOtherPaymentComponent from './create-update-other-payment-component'
import { getUnpaidOtherInvoice } from '@/types/other-payment/unpaid-other-invoice'
import { unpaidOtherInvoiceToOtherInvoicePaymentItems } from '@/types/other-payment/unpaid-other-invoice-item'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'เพิ่มใบสำคัญจ่ายอื่น',
}

type Props = {
    searchParams: Promise<{ contactId?: string }>
}

export default async function CreateOtherPaymentPage(props: Props) {
    const searchParams = await props.searchParams;

    const {
        contactId
    } = searchParams;

    const unpaidPurchases = Number(contactId)
        ? await getUnpaidOtherInvoice(Number(contactId))
        : []
    const unpaidItems =
        unpaidOtherInvoiceToOtherInvoicePaymentItems(unpaidPurchases)

    const paymentMethods = await getPaymentMethods()
    return (
        <>
            <h1 className="my-2 text-3xl transition-colors">
                เพิ่มใบสำคัญจ่ายอื่น
            </h1>
            <CreateUpdateOtherPaymentComponent
                paymentMethods={paymentMethods}
                unpaidItems={unpaidItems}
            />
        </>
    )
}
