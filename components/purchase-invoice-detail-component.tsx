'use client'

import { DatePickerWithPresets } from '@/components/date-picker-preset'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useRef } from 'react'
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
import TableBodyFooterWrapper from '@/components/select-search-main-sku/table-body-footer-wrapper'
import { createInvoice } from '@/app/actions/sales/create-invoice'
import toast from 'react-hot-toast'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { getPurchaseInvoiceDetail } from '@/app/actions/purchase/purchase-invoice-detail'
import SelectSearchVendor from './select-search-vendor'

type Props = {
    document?: Awaited<ReturnType<typeof getPurchaseInvoiceDetail>>
}

export default function PurchaseInvoiceDetailComponent({ document }: Props) {
    const session = useSession()

    return (
        <>
            <div className="mb-2 p-3">
                <div className="flex gap-3">
                    <div className="space-x-2">
                        <Label>วันที่</Label>
                        <DatePickerWithPresets
                            defaultDate={document?.date}
                            disabled
                        />
                    </div>
                    <div className="space-x-2">
                        <Label>No.</Label>
                        <Input
                            className="w-auto"
                            placeholder="Optional"
                            defaultValue={document?.documentId}
                            disabled
                        />
                    </div>
                    {session.data?.user.role === 'ADMIN' && (
                        <div>
                            <Link href={`/purchase/${document?.documentId}/edit`}>
                                <Button type="button" variant={'destructive'}>
                                    Edit
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
                <div className="flex gap-3">
                    <div className="my-1 flex items-baseline space-x-2">
                        <Label>คู่ค้า</Label>
                        <SelectSearchVendor
                            name={'vendorId'}
                            hasTextArea={true}
                            // placeholder="Optional"
                            defaultValue={String(
                                document?.ApSubledger?.Contact.id
                            )}
                            defaultAddress={{
                                address: `${document?.contactName}\n${document?.address}`,
                                phone: document?.phone || '',
                                taxId: document?.taxId || '',
                            }}
                            disabled
                        />
                    </div>
                </div>
                <Table className="mt-3">
                    <TableCaption>
                        <Textarea defaultValue={document?.remark} />
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Barcode</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">
                                Quantity
                            </TableHead>
                            <TableHead className="text-right">Unit</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {document?.SkuIn.map((item) => (
                            <TableRow key={item.barcode}>
                                <TableCell>{item.barcode}</TableCell>
                                <TableCell>
                                    <p>
                                        {
                                            item.GoodsMaster.SkuMaster.mainSku
                                                .name
                                        }
                                    </p>
                                    <p>{item.GoodsMaster.SkuMaster.detail}</p>
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">{`${item.unit}(${item.quantity})`}</TableCell>
                                <TableCell className="text-right">
                                    {(item.cost + item.vat) / item.quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.cost + item.vat}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={5} className="text-right">
                                Total
                            </TableCell>
                            <TableCell className="text-right">
                                {Math.abs(
                                    Number(
                                        document?.GeneralLedger.find(
                                            (item) =>
                                                item.chartOfAccountId ===
                                                    11000 ||
                                                item.chartOfAccountId === 21000
                                        )?.amount
                                    )
                                )}
                            </TableCell>
                        </TableRow>
                        <TableRow className="bg-background">
                            <TableCell
                                colSpan={6}
                                className="space-x-1 text-right"
                            ></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </>
    )
}
