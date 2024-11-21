'use client'

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
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
import { Dialog, DialogContent } from '@/components/ui/dialog'
import Image from 'next/image'

type Props = {}

export default function CustomerDisplay({}: Props) {
    const [data, setData] = React.useState<{
        documentDetail: DocumentDetail
        items: DocumentItem[]
        images: string[]
        showImage: boolean
        imageIndex: number
    }>({
        documentDetail: getDefaultDocumentDetail(),
        items: [],
        images: [],
        showImage: false,
        imageIndex: 0,
    })

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Ensure the event data has the correct shape
            if (
                !event.data.documentDetail &&
                !event.data.items &&
                !event.data.images
            )
                return

            const data: {
                documentDetail: DocumentDetail
                items: DocumentItem[]
                images: string[]
                showImage: boolean
                imageIndex: number
            } = event.data
            setData(data)
            console.log(data)
        }

        // Listen for messages from the cashier window
        window.addEventListener('message', handleMessage)

        return () => {
            window.removeEventListener('message', handleMessage)
        }
    }, [])

    return (
        <div className="absolute left-0 top-0 z-50 h-screen w-screen bg-background p-2">
            <Dialog open={!!data.images.length && data.showImage}>
                <DialogContent>
                    <Image
                        src={data.images?.[data.imageIndex]}
                        alt="second-display-image"
                        width={500}
                        height={500}
                        unoptimized
                    />
                </DialogContent>
            </Dialog>
            <div className="flex h-full flex-col gap-1 rounded-md border-2 border-dashed p-4">
                <div className="grid grid-cols-2">
                    <div>รหัสลูกค้า: {data.documentDetail?.contactId}</div>
                    <div className="col-start-2 row-span-2 flex justify-between pr-5 text-5xl">
                        <span>ยอดรวม </span>
                        <span>
                            {data.items
                                .reduce(
                                    (acc, item) =>
                                        acc + item.quantity * item.pricePerUnit,
                                    0
                                )
                                .toLocaleString()}
                        </span>
                    </div>
                    <div className="col-start-1">
                        ชื่อ: {data.documentDetail?.contactName}
                    </div>
                    <div className="col-start-1">
                        ที่อยู่: {data.documentDetail?.address}
                    </div>
                    <div className="col-start-1">
                        โทร: {data.documentDetail?.phone}
                    </div>
                    <div>
                        เลขประจำตัวผู้เสียภาษี: {data.documentDetail?.taxId}
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Barcode</TableHead>
                            <TableHead>ชื่อสินค้า</TableHead>
                            <TableHead className="text-right">จำนวน</TableHead>
                            <TableHead className="text-right">
                                ราคาต่อหน่วย
                            </TableHead>
                            <TableHead className="text-right">รวม</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.items?.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.barcode}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">
                                    {item.quantity.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.pricePerUnit.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {(
                                        item.quantity * item.pricePerUnit
                                    ).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={4} className="text-right">
                                รวม
                            </TableCell>
                            <TableCell className="text-right">
                                {data.items
                                    .reduce(
                                        (acc, item) =>
                                            acc +
                                            item.quantity * item.pricePerUnit,
                                        0
                                    )
                                    .toLocaleString()}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </div>
    )
}
