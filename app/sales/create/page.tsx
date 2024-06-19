import React from 'react'
import CreateOrUpdateSalesInvoiceComponent from './create-update-sales-invoice-component'
import { getPaymentMethods } from '@/app/actions/accounting'
import Link from 'next/link'

type Props = {}

export default async function CreateSalesInvoicePage({}: Props) {
    const paymentMethods = await getPaymentMethods()
    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/sales`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>

                {/* <Link href="/sales/create">
                    <Button
                        variant="ghost"
                        className="mb-2"
                    >{`Create New`}</Button>
                </Link> */}
            </div>
            <h1 className="my-2 text-3xl transition-colors">สร้างบิลขาย</h1>
            <CreateOrUpdateSalesInvoiceComponent
                paymentMethods={paymentMethods}
            />
        </>
    )
}
