'use client'

import { generateBarcode } from '@/app/actions/inventory/generateBarcode'
import React from 'react'

type Props = {}

import { useState } from 'react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { ClipboardIcon } from 'lucide-react'

export default function GenerateBarcodeButton({}: Props) {
    const [copied, setCopied] = useState(false)

    const onClick = async () => {
        const barcode = await generateBarcode()
        if (!barcode) {
            toast.error('Failed to generate barcode')
            return
        }
        navigator.clipboard.writeText(barcode)
        toast.success('Barcode copied to clipboard')
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }
    return (
        <div className="flex items-center" onClick={onClick}>
            <div className="mr-2 text-sm font-medium">Generate Barcode</div>
            <ClipboardIcon
                className={cn(
                    'h-5 w-5',
                    copied ? 'text-green-500' : 'text-gray-500'
                )}
            />
        </div>
    )
}
