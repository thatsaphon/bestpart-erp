'use client'

import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'
import BlobProviderClient from '@/components/pdf/blob-provider-client'
import SalesInvoicePdf_5x9 from '@/components/pdf/invoice-5.5-9'
import { GetSales } from '@/types/sales'
import React from 'react'

type Props = { document: GetSales }

export default function SalesInvoiceLinkComponent({ document }: Props) {
    return (
        <BlobProviderClient>
            <SalesInvoicePdf_5x9 document={document} />
        </BlobProviderClient>
    )
}
