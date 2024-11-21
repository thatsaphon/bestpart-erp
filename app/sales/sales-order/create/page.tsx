import React from 'react'
import CreateOrUpdateSalesInvoiceComponent from './create-update-sales-invoice-component'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import Link from 'next/link'
import { Metadata } from 'next'
import { getCustomerOrderDefaultFunction } from '@/types/customer-order/customer-order'
import { getQuotationDefaultFunction } from '@/types/quotation/quotation'
import { getDepositAmount } from '@/actions/get-deposit-amount'

type Props = {
    searchParams: Promise<{ contactId: string }>
}

export const metadata: Metadata = {
    title: 'สร้างบิลขาย',
}

export default async function CreateSalesInvoicePage(props: Props) {
    const searchParams = await props.searchParams;

    const {
        contactId
    } = searchParams;

    const paymentMethods = await getPaymentMethods()

    const pendingCustomerOrders = contactId
        ? await getCustomerOrderDefaultFunction({
              CustomerOrder: {
                  contactId: Number(contactId),
                  status: {
                      notIn: ['Cancelled', 'Closed'],
                  },
              },
          })
        : []
    const quotations = contactId
        ? await getQuotationDefaultFunction({
              Quotation: {
                  contactId: Number(contactId),
              },
          })
        : []

    const depositAmount = await getDepositAmount(Number(contactId))
    return (
        <>
            <h1 className="my-2 text-3xl transition-colors">สร้างบิลขาย</h1>
            <CreateOrUpdateSalesInvoiceComponent
                paymentMethods={paymentMethods}
                quotations={quotations}
                pendingOrExistingCustomerOrders={pendingCustomerOrders}
                depositAmount={depositAmount}
            />
        </>
    )
}
