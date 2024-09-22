import { getPaymentMethods } from '@/actions/get-payment-methods'
import React from 'react'
import CreateUpdatePurchasePaymentComponents from './create-update-purchase-payment-components'
import { getUnpaidPurchases } from '@/types/purchase-payment/unpaid-purchase'
import { unpaidPurchaseToPurchasePaymentItems } from '@/types/purchase-payment/unpaid-purchase-item'

type Props = {
    searchParams: {
        contactId?: string
    }
}

export default async function CreatePaymentPage({
    searchParams: { contactId },
}: Props) {
    const unpaidPurchases = Number(contactId)
        ? await getUnpaidPurchases(Number(contactId))
        : []
    const unpaidItems = unpaidPurchaseToPurchasePaymentItems(unpaidPurchases)

    const paymentMethods = await getPaymentMethods()

    return (
        <>
            <h1 className="my-2 text-3xl transition-colors">
                สร้างใบสำคัญจ่าย
            </h1>
            <CreateUpdatePurchasePaymentComponents
                paymentMethods={paymentMethods}
                unpaidItems={unpaidItems}
            />
        </>
    )
}
