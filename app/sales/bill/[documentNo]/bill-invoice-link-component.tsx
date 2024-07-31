'use client'

import BillingNotePdf, {
    BillingNoteDetail,
} from '@/components/pdf/billing-note-pdf'
import BlobProviderClient from '@/components/pdf/blob-provider-client'
import React from 'react'

type Props = {
    document: BillingNoteDetail
}

export default function BillInvoiceLinkComponent({ document }: Props) {
    return (
        <BlobProviderClient>
            <BillingNotePdf document={document} />
        </BlobProviderClient>
    )
}
