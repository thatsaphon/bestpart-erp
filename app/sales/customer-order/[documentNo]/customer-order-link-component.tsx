'use client'

import BlobProviderClient from '@/components/pdf/blob-provider-client'
import React from 'react'
import getCustomerOrderDetail from './get-customer-order-detail'
import CustomerOrderPdf_5x9 from '@/components/pdf/customer-order-5.5-9'
import { GetCustomerOrder } from '@/types/customer-order/customer-order'

type Props = { document: GetCustomerOrder }

export default function CustomerOrderLinkComponent({ document }: Props) {
    return (
        <BlobProviderClient>
            <CustomerOrderPdf_5x9 document={document} />
        </BlobProviderClient>
    )
}
