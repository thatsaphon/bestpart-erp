import React from 'react'
import { getPaymentMethods } from '@/app/actions/accounting'
import Link from 'next/link'
import { Metadata } from 'next'
import CreateOrUpdateQuotationComponent from './create-update-quotation-component'

type Props = {}

export const metadata: Metadata = {
    title: 'สร้างบิลขาย',
}

export default async function CreateQuotationPage({}: Props) {
    // const paymentMethods = await getPaymentMethods()
    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/sales/quotation`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">สร้างใบเสนอราคา</h1>
            <CreateOrUpdateQuotationComponent />
        </>
    )
}
