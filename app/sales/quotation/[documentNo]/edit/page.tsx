import React from 'react'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import Link from 'next/link'
import { Metadata } from 'next'
import CreateOrUpdateQuotationComponent from '../../create/create-update-quotation-component'
import {
    DocumentRemark,
    MainSkuRemark,
    Prisma,
    SkuMasterRemark,
} from '@prisma/client'
import prisma from '@/app/db/db'
import { getQuotationDefaultFunction } from '@/types/quotation/quotation'
import { quotationItemsToDocumentItems } from '@/types/quotation/quotation-items'

type Props = {
    params: Promise<{
        documentNo: string
    }>
}

export const metadata: Metadata = {
    title: 'สร้างบิลขาย',
}

export default async function UpdateQuotationPage(props: Props) {
    const params = await props.params;

    const {
        documentNo
    } = params;

    const existingQuotation = await getQuotationDefaultFunction({
        documentNo,
    })

    return (
        <>
            <h1 className="my-2 text-3xl transition-colors">สร้างใบเสนอราคา</h1>
            <CreateOrUpdateQuotationComponent
                existingQuotation={existingQuotation[0]}
            />
        </>
    )
}
