'use client'

import SalesBillPdf from '@/components/pdf/sales-bill-pdf'
import BlobProviderClient from '@/components/pdf/blob-provider-client'
import React from 'react'
import { getSalesBill } from '@/types/sales-bill/sales-bill'

type Props = {
    document: getSalesBill
}

export default function SalesReceivedLinkComponent({ document }: Props) {
    return (
        <BlobProviderClient>
            <SalesBillPdf document={document} />
        </BlobProviderClient>
    )
}
