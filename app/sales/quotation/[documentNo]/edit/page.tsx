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
    params: {
        documentNo: string
    }
}

export const metadata: Metadata = {
    title: 'สร้างบิลขาย',
}

export default async function UpdateQuotationPage({
    params: { documentNo },
}: Props) {
    const quotation = await getQuotationDefaultFunction({
        documentNo,
    })

    const quotationItems = quotationItemsToDocumentItems(
        quotation[0].Quotation?.QuotationItem
    )

    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/sales/quotation`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">สร้างใบเสนอราคา</h1>
            <CreateOrUpdateQuotationComponent
                defaultItems={quotationItems}
                // defaultItems={quotation.map((x) => ({
                //     ...x,
                //     MainSkuRemarks: mainSkuRemarks.filter(
                //         (y) => y.mainSkuId === x.mainSkuId
                //     ),
                //     SkuMasterRemarks: skuMasterRemarks.filter(
                //         (y) => y.skuMasterId === x.skuMasterId
                //     ),
                //     images: images
                //         .filter((y) => y.skuMasterId === x.skuMasterId)
                //         .map((y) => y.images),
                // }))}
                defaultDocumentDetails={{
                    ...quotation[0],
                    contactId: quotation[0].Quotation?.contactId,
                }}
                // defaultRemarks={defaultRemarks}
            />
        </>
    )
}
