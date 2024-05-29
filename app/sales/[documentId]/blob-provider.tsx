'use client'

import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'
import SalesInvoicePdf from '@/components/pdf/invoice-pdf'
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
            {isClient ? (
                <BlobProvider
                    document={<SalesInvoicePdf document={document} />}
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
            ) : (
                <Button disabled>Loading</Button>
            )}
        </>
    )
}
