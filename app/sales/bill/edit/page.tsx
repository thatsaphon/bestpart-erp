import Link from 'next/link'
import React from 'react'
import CreateUpdateSalesBillComponents from '../create/create-update-sales-bill-components'

type Props = {}

export default function SalesBillEditPage({}: Props) {
    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/sales/sales-bill`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">สร้างใบวางบิล</h1>
            <CreateUpdateSalesBillComponents
            // unpaidItems={unpaidItems}
            // paymentMethods={paymentMethods}
            />
        </>
    )
}
