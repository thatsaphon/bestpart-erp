import React from 'react'
import CreateOrUpdateSalesInvoiceComponent from './create-update-sales-invoice-component'
import { getPaymentMethods } from '@/app/actions/accounting'

type Props = {}

export default async function CreateSalesInvoicePage({}: Props) {
    const paymentMethods = await getPaymentMethods()
    return (
        <CreateOrUpdateSalesInvoiceComponent paymentMethods={paymentMethods} />
    )
}
