'use client'

import BlobProviderClient from '@/components/pdf/blob-provider-client'
import SalesInvoicePdf_5x9 from '@/components/pdf/invoice-5.5-9'
import React from 'react'
import getCustomerOrderDetail from './get-customer-order-detail'
import QuotationPdf_5x9 from '@/components/pdf/quotation-5.5-9'

type Props = { document: Awaited<ReturnType<typeof getCustomerOrderDetail>> }

export default function QuotationLinkComponent({ document }: Props) {
    return (
        <BlobProviderClient>
            <QuotationPdf_5x9 document={document} />
        </BlobProviderClient>
    )
}
