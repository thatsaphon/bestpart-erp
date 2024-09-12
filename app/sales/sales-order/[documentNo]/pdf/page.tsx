'use client'

import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'
import SalesInvoicePdf_5x9 from '@/components/pdf/invoice-5.5-9'
import { GetSales, getSalesDefaultFunction } from '@/types/sales/sales'
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
    params: { documentNo: string }
}

export default function InvoicePDFPage({ params: { documentNo } }: Props) {
    const [document, setDocument] = useState<GetSales | null>(null)

    useEffect(() => {
        async function fetchInvoice(documentNo: string) {
            const result = await getSalesDefaultFunction({ documentNo })
            setDocument(result[0])
        }
        fetchInvoice(documentNo)
    }, [documentNo])

    return (
        <div>
            {!!document && (
                <PDFViewer
                    className="h-full w-full"
                    height={'100vh'}
                    width={'100vw'}
                >
                    <SalesInvoicePdf_5x9
                        document={document}
                        key={new Date().getTime()}
                    />
                </PDFViewer>
            )}
        </div>
    )
}
