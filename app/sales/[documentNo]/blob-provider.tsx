'use client'

import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'
import BillingNotePdf, {
    BillingNoteDetail,
} from '@/components/pdf/billing-note-pdf'
import SalesInvoicePdf_5x9 from '@/components/pdf/invoice-5.5-9'
import { Button } from '@/components/ui/button'
import ReactPDF, { BlobProvider } from '@react-pdf/renderer'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

type DocumentType = 'SalesInvoicePdf_5x9' | 'BillingNotePdf'

type Props = {
    documentType: DocumentType
    document: unknown
}

const components = {
    SalesInvoicePdf_5x9,
    BillingNotePdf,
}

export default function BlobProviderClient({ documentType, document }: Props) {
    const [isClient, setIsClient] = useState(false)

    const DynamicComponent = components[documentType]

    useEffect(() => {
        setIsClient(true)
    }, [])
    return (
        <>
            {!isClient && <Button disabled>Loading</Button>}
            {isClient && (
                <BlobProvider
                    document={<DynamicComponent document={document} />}
                >
                    {({ blob, url, loading, error }) =>
                        !url ? (
                            <Button disabled>Loading</Button>
                        ) : (
                            <Link
                                target="_blank"
                                rel="noopener noreferrer"
                                href={url}
                            >
                                <Button type="button">Print</Button>
                            </Link>
                        )
                    }
                </BlobProvider>
            )}
        </>
    )
}
