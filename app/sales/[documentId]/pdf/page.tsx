'use client'

import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'
import SalesInvoicePdf from '@/components/pdf/invoice-pdf'
import PDFViewerClient from '@/components/pdf/pdf-viewer-client'
import dynamic from 'next/dynamic'

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <p>Loading...</p>,
    }
)
import React, { Suspense, useEffect, useState } from 'react'

type Props = {
    params: { documentId: string }
}

export default function InvoicePDFPage({ params: { documentId } }: Props) {
    const [document, setDocument] =
        useState<Awaited<ReturnType<typeof getSalesInvoiceDetail>>>(null)

    useEffect(() => {
        async function fetchInvoice(documentId: string) {
            const result = await getSalesInvoiceDetail(documentId)
            setDocument(result)
        }
        fetchInvoice(documentId)
    }, [documentId])

    return (
        <div>
            <PDFViewer
                className="h-full w-full"
                height={'100vh'}
                width={'100vw'}
            >
                <SalesInvoicePdf
                    document={document}
                    key={new Date().getTime()}
                />
            </PDFViewer>
        </div>
    )
}