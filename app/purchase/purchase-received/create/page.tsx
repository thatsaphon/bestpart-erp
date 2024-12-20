import React from 'react'
import CreateOrUpdatePurchaseInvoiceComponent from './create-update-purchase-invoice-component'
import Link from 'next/link'
import { getPurchaseOrderDefaultFunction } from '@/types/purchase-order/purchase-order'

type Props = {}

export default async function CreatePurchaseInvoicePage({}: Props) {
    const pendingPurchaseOrders = await getPurchaseOrderDefaultFunction({
        PurchaseOrder: {
            status: {
                in: ['Draft', 'PartiallyReceived', 'Submitted'],
            },
        },
    })
    return (
        <div className="pb-24">
            <h1 className="my-2 text-3xl transition-colors">สร้างบิลซื้อ</h1>
            <CreateOrUpdatePurchaseInvoiceComponent
                pendingOrExistingPurchaseOrders={pendingPurchaseOrders}
            />
        </div>
    )
}
