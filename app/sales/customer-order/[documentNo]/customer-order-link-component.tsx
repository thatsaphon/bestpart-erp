'use client'

import BlobProviderClient from '@/components/pdf/blob-provider-client'
import React from 'react'
import getCustomerOrderDetail from './get-customer-order-detail'
import CustomerOrderPdf_5x9 from '@/components/pdf/customer-order-5.5-9'

type Props = { document: Awaited<ReturnType<typeof getCustomerOrderDetail>> }

export default function CustomerOrderLinkComponent({ document }: Props) {
    return (
        <BlobProviderClient>
            <CustomerOrderPdf_5x9 document={document} />
        </BlobProviderClient>
    )
}
