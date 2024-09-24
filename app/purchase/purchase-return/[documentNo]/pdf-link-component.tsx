'use client'

import BlobProviderClient from '@/components/pdf/blob-provider-client'
import PurchaseReturnInvoicePdf_5x9 from '@/components/pdf/purchase-invoice-5.5-9'
import { GetPurchaseReturn } from '@/types/purchase-return/purchase-return'
import React from 'react'

type Props = {
    document: GetPurchaseReturn
}

export default function ReturnInvoicePdfLinkComponent({ document }: Props) {
    return (
        <BlobProviderClient>
            <PurchaseReturnInvoicePdf_5x9 document={document} />
        </BlobProviderClient>
    )
}
