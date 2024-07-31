'use client'

import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'
import { getSalesReturnInvoiceDetail } from '@/app/actions/sales/return-invoice-detail'
import BillingNotePdf, {
    BillingNoteDetail,
} from '@/components/pdf/billing-note-pdf'
import SalesInvoicePdf_5x9 from '@/components/pdf/invoice-5.5-9'
import SalesReturnInvoicePdf_5x9 from '@/components/pdf/return-invoice-5.5-9'
import { Button } from '@/components/ui/button'
import { BlobProvider, DocumentProps } from '@react-pdf/renderer'
import Link from 'next/link'
import React, {
    JSXElementConstructor,
    ReactElement,
    useEffect,
    useState,
} from 'react'

type Props = {
    children: ReactElement<DocumentProps, string | JSXElementConstructor<any>>
}

/**
 * This component is used to render a PDF document on the client side.
 * It should be used in combination with the BlobProvider component,
 * which is a wrapper around the react-pdf/renderer BlobProvider component.
 * The BlobProvider component is used to provide a blob to the BlobProviderClientChildren component,
 * which is then used to render a PDF document on the client side.
 * This component is used to render a PDF document on the client side,
 * and provides a loading state while the PDF document is being rendered.
 *
 * @param {Props} props - The props object containing a single child element, which is the Document component which is used to render the PDF document.
 * @return {JSX.Element} - The JSX element containing a loading state while the PDF document is being rendered, and the PDF document itself once it has been rendered.
 */
//
export default function BlobProviderClient({ children }: Props) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])
    return (
        <>
            {!isClient && <Button disabled>Loading</Button>}
            {isClient && (
                <BlobProvider document={children}>
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
