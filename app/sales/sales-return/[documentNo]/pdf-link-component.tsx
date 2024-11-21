'use client'

import BlobProviderClient from '@/components/pdf/blob-provider-client'
import SalesReturnInvoicePdf_5x9 from '@/components/pdf/return-invoice-5.5-9'
import { GetSalesReturn } from '@/types/sales-return/sales-return'
import React from 'react'

type Props = {
    document: GetSalesReturn
}

export default function ReturnInvoicePdfLinkComponent({ document }: Props) {
    return (
        <BlobProviderClient>
            <SalesReturnInvoicePdf_5x9 document={document} />
        </BlobProviderClient>
    )
}
