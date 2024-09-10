import Link from 'next/link'
import React from 'react'
import CreateOrUpdatePurchaseOrderComponent from './create-update-purchase-order-component'

type Props = {}

export default function CreatePurchaseOrderPage({}: Props) {
    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/purchase/purchase-received`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">สร้างใบสั่งซื้อ</h1>
            <CreateOrUpdatePurchaseOrderComponent />
        </>
    )
}
