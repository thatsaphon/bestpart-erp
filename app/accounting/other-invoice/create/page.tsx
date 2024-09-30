import Link from 'next/link'
import React from 'react'
import CreateUpdateOtherInvoiceComponent from './create-update-other-invoice'
import prisma from '@/app/db/db'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import { getServiceAndNonStockItemsDefaultFunction } from '@/types/service-and-non-stock-item/service-and-non-stock-item'

type Props = {}

export default async function CreateOtherExpensePage({}: Props) {
    const nonStockItems = await getServiceAndNonStockItemsDefaultFunction({
        canOtherInvoice: true,
    })
    const paymentMethods = await getPaymentMethods()

    return (
        <>
            <h1 className="my-2 text-2xl transition-colors">
                บันทึกบิลค่าใช้จ่ายใหม่
            </h1>
            <CreateUpdateOtherInvoiceComponent
                nonStockItems={nonStockItems}
                paymentMethods={paymentMethods}
                // chartOfAccounts={otherExpenses}
                // paymentMethods={await getPaymentMethods()}
            />
        </>
    )
}
