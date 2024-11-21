'use client'

import { Button } from '@/components/ui/button'
import { BlobProvider, DocumentProps } from '@react-pdf/renderer'
import Link from 'next/link'
import { JSXElementConstructor, ReactElement, useEffect, useState } from 'react'

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
 * no error in next 14.2.5
 * error in next 14.2.10
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
