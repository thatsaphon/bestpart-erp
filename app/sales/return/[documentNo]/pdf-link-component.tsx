'use client'

import { getSalesReturnInvoiceDetail } from '@/app/actions/sales/return-invoice-detail'
import BlobProviderClient from '@/components/pdf/blob-provider-client'
import SalesReturnInvoicePdf_5x9 from '@/components/pdf/return-invoice-5.5-9'
import React from 'react'

type Props = {
    document: Awaited<ReturnType<typeof getSalesReturnInvoiceDetail>>
}

export default function ReturnInvoicePdfLinkComponent({ document }: Props) {
    return (
        <BlobProviderClient>
            <SalesReturnInvoicePdf_5x9 document={document} />
        </BlobProviderClient>
    )
}
