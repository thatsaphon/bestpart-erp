'use client'

import React, { useEffect, useState } from 'react'
import TableFooterWrapper from './table-footer-wrapper'
import { TableBody, TableCell, TableRow } from '../ui/table'
import SelectSearchMainSkuWrapper from './select-search-main-sku-wrapper'
import { findGoodsMasterByBarcode } from '@/app/actions/inventory/goodsMaster/findGoodsMasterByBarcode'
import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'

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
                                {item.quantity}
                            </TableCell>
                            <TableCell className="text-right">{`${item.unit}(${item.quantityPerUnit})`}</TableCell>
                            <TableCell className="text-right">
                                {(item.price + item.vat) / item.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                                {item.price + item.vat}
                            </TableCell>
                        </TableRow>
                    ))}
            </TableBody>
            <TableFooterWrapper
                items={items}
                setTotalRows={setTotalRows}
                setItems={setItems}
            />
        </>
    )
}
