import { getPaymentMethods } from '@/actions/get-payment-methods'
import React from 'react'
import CreateUpdatePurchasePaymentComponents from './create-update-purchase-payment-components'
import { getUnpaidPurchases } from '@/types/purchase-payment/unpaid-purchase'
import { unpaidPurchaseToPurchasePaymentItems } from '@/types/purchase-payment/unpaid-purchase-item'

type Props = {
    searchParams: Promise<{
        contactId?: string
    }>
}

export default async function CreatePaymentPage(props: Props) {
    const searchParams = await props.searchParams;

    const {
        contactId
    } = searchParams;

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
