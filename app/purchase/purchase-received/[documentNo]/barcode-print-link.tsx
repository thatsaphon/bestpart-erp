import BarcodePdf from '@/components/pdf/barcode-pdf'
import BlobProviderClient from '@/components/pdf/blob-provider-client'
import { PrintBarcode } from '@/types/barcode/print-barcode'
import React from 'react'

type Props = {
    items: PrintBarcode
}

export default function BarcodePrintLink({ items }: Props) {
    return (
        <BlobProviderClient>
            <BarcodePdf items={items} />
        </BlobProviderClient>
    )
}
