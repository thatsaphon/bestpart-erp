'use client'

import React, { useState } from 'react'
import TableFooterWrapper from './table-footer-wrapper'
import { TableBody } from '../ui/table'
import SelectSearchMainSkuWrapper from './select-search-main-sku-wrapper'
import { findGoodsMasterByBarcode } from '@/app/actions/inventory/goodsMaster/findGoodsMasterByBarcode'

type Props = {}

export default function TableBodyFooterWrapper({}: Props) {
    const [totalRows, setTotalRows] = useState<string[]>([])
    const [items, setItems] = useState<
        (Awaited<ReturnType<typeof findGoodsMasterByBarcode>> & {
            quantity: number
            rowId: string
        })[]
    >([])
    return (
        <>
            <TableBody>
                <SelectSearchMainSkuWrapper
                    totalRows={totalRows}
                    setTotalRows={setTotalRows}
                    setItems={setItems}
                />
            </TableBody>
            <TableFooterWrapper items={items} />
        </>
    )
}
