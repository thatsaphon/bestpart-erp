import Link from 'next/link'
import React from 'react'
import CreateOrUpdatePurchaseOrderComponent from './create-update-purchase-order-component'
import { getCustomerOrderDefaultFunction } from '@/types/customer-order/customer-order'

type Props = {}

export default async function CreatePurchaseOrderPage({}: Props) {
    const customerOrders = await getCustomerOrderDefaultFunction({
        CustomerOrder: { status: { in: ['Pending'] } },
    })
    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/purchase/purchase-received`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">สร้างใบสั่งซื้อ</h1>
            <CreateOrUpdatePurchaseOrderComponent
                pendingOrExistingCustomerOrders={customerOrders}
            />
        </>
    )
}
