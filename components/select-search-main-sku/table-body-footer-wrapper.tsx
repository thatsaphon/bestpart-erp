import React, { useEffect, useState } from 'react'
import TableFooterWrapper from './table-footer-wrapper'
import { TableBody, TableCell, TableFooter, TableRow } from '../ui/table'
import SelectSearchMainSkuWrapper from './select-search-main-sku-wrapper'
import { findGoodsMasterByBarcode } from '@/app/actions/inventory/goodsMaster/findGoodsMasterByBarcode'
import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'
import { Button } from '../ui/button'
import Link from 'next/link'
import { BlobProvider } from '@react-pdf/renderer'
import SalesInvoicePdf from '../pdf/invoice-pdf'
import { cn } from '@/lib/utils'

type Props = {
    type?: 'sales' | 'purchase'
    document?: Awaited<ReturnType<typeof getSalesInvoiceDetail>>
}

type rowItemType = Awaited<ReturnType<typeof findGoodsMasterByBarcode>> & {
    quantity: number
    rowId: string
    price?: number
}

export default function TableBodyFooterWrapper({
    type = 'sales',
    document,
}: Props) {
    const [totalRows, setTotalRows] = useState<string[]>([])
    const [items, setItems] = useState<rowItemType[]>([])
    const [isUpdated, setIsUpdated] = useState(false)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    return (
        <>
            <TableBody>
                {(!document || isUpdated) && (
                    <SelectSearchMainSkuWrapper
                        totalRows={totalRows}
                        setTotalRows={setTotalRows}
                        setItems={setItems}
                        type={type}
                    />
                )}
                {document &&
                    !isUpdated &&
                    document.SkuOut.map((item) => (
                        <TableRow key={item.barcode}>
                            <TableCell>{item.barcode}</TableCell>
                            <TableCell>
                                {item.GoodsMaster.SkuMaster.mainSku.name}
                            </TableCell>
                            <TableCell className="text-right">
                                {item.quantity / item.quantityPerUnit}
                            </TableCell>
                            <TableCell className="text-right">{`${item.unit}(${item.quantityPerUnit})`}</TableCell>
                            <TableCell className="text-right">
                                {(item.price + item.vat) /
                                    (item.quantity / item.quantityPerUnit)}
                            </TableCell>
                            <TableCell className="text-right">
                                {item.price + item.vat}
                            </TableCell>
                        </TableRow>
                    ))}
            </TableBody>
            {(!document || isUpdated) && (
                <TableFooterWrapper
                    items={items}
                    setTotalRows={setTotalRows}
                    setItems={setItems}
                />
            )}
            {document && !isUpdated && (
                <TableFooter>
                    <TableRow className="bg-background hover:bg-background">
                        <TableCell colSpan={5} className="text-right ">
                            Total (Excluded Vat)
                        </TableCell>
                        <TableCell className="text-right">
                            {Math.abs(
                                Number(
                                    document.GeneralLedger.find(
                                        (item) =>
                                            item.chartOfAccountId === 41000
                                    )?.amount
                                )
                            )}
                        </TableCell>
                    </TableRow>
                    <TableRow className="bg-background hover:bg-background">
                        <TableCell colSpan={5} className="text-right">
                            Vat
                        </TableCell>
                        <TableCell className="text-right">
                            {Math.abs(
                                Number(
                                    document.GeneralLedger.find(
                                        (item) =>
                                            item.chartOfAccountId === 23100
                                    )?.amount
                                )
                            )}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={5} className="text-right">
                            Total
                        </TableCell>
                        <TableCell className="text-right">
                            {Math.abs(
                                Number(
                                    document.GeneralLedger.find(
                                        (item) =>
                                            item.chartOfAccountId === 11000 ||
                                            item.chartOfAccountId === 12000
                                    )?.amount
                                )
                            )}
                        </TableCell>
                    </TableRow>
                    <TableRow className="bg-background">
                        <TableCell colSpan={6} className="space-x-1 text-right">
                            <Button type="button" variant={'destructive'}>
                                Cancel
                            </Button>
                            {isClient ? (
                                <BlobProvider
                                    document={
                                        <SalesInvoicePdf document={document} />
                                    }
                                >
                                    {({ blob, url, loading, error }) =>
                                        !url ? (
                                            <Button disabled>Loading</Button>
                                        ) : (
                                            <Link
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                href={url}
                                            >
                                                <Button type="button">
                                                    Print
                                                </Button>
                                            </Link>
                                        )
                                    }
                                </BlobProvider>
                            ) : (
                                <Button disabled>Loading</Button>
                            )}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            )}
        </>
    )
}
