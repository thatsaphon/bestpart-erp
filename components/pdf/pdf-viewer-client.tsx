'use client'

import { DocumentProps } from '@react-pdf/renderer'
import dynamic from 'next/dynamic'

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <p>Loading...</p>,
    }
)
import React, {
    JSXElementConstructor,
    ReactElement,
    useEffect,
    useState,
} from 'react'

export default function PDFViewerClient({
    children,
}: {
    children: ReactElement<DocumentProps, string | JSXElementConstructor<any>>
}) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    return <PDFViewer>{children}</PDFViewer>
}
