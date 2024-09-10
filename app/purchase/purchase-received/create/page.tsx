import React from 'react'
import CreateOrUpdatePurchaseInvoiceComponent from './create-update-purchase-invoice-component'
import Link from 'next/link'

type Props = {}

export default function CreatePurchaseInvoicePage({}: Props) {
    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/purchase/purchase-received`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">สร้างบิลซื้อ</h1>
            <CreateOrUpdatePurchaseInvoiceComponent />
        </>
    )
}
