'use client'

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DocumentDetail,
    getDefaultDocumentDetail,
} from '@/types/document-detail'
import { DocumentItem } from '@/types/document-item'
import React, { useEffect } from 'react'

type Props = {}

export default function page({}: Props) {
    const [data, setData] = React.useState<{
        documentDetail: DocumentDetail
        items: DocumentItem[]
    }>({
        documentDetail: getDefaultDocumentDetail(),
        items: [],
    })

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Ensure the event data has the correct shape
            if (!event.data.documentDetail && !event.data.items) return
            const data: {
                documentDetail: DocumentDetail
                items: DocumentItem[]
            } = event.data
            setData(data)
        }

        // Listen for messages from the cashier window
        window.addEventListener('message', handleMessage)

        return () => {
            window.removeEventListener('message', handleMessage)
        }
    }, [])

    return (
        <div className="absolute left-0 top-0 z-50 h-screen w-screen bg-background">
            {data.documentDetail?.contactName}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Barcode</TableHead>
                        <TableHead>ชื่อสินค้า</TableHead>
                        <TableHead>จำนวน</TableHead>
                        <TableHead>ราคาต่อหน่วย</TableHead>
                        <TableHead>รวม</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.items?.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.barcode}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.pricePerUnit}</TableCell>
                            <TableCell>
                                {item.quantity * item.pricePerUnit}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
