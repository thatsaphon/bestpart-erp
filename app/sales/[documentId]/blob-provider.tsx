'use client'

import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'
import SalesInvoicePdf_5x9 from '@/components/pdf/invoice-5.5-9'
import { Button } from '@/components/ui/button'
import { BlobProvider } from '@react-pdf/renderer'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

type Props = { document: Awaited<ReturnType<typeof getSalesInvoiceDetail>> }

export default function BlobProviderClient({ document }: Props) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])
    return (
        <>
            {!isClient && <Button disabled>Loading</Button>}
            {isClient && (
                <BlobProvider
                    document={<SalesInvoicePdf_5x9 document={document} />}
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
