'use client'

import React, { useEffect } from 'react'
import { TableFooter, TableRow, TableCell } from '../ui/table'
import { findGoodsMasterByBarcode } from '@/app/actions/inventory/goodsMaster/findGoodsMasterByBarcode'

type Props = {
    items: (Awaited<ReturnType<typeof findGoodsMasterByBarcode>> & {
        quantity: number
        rowId: string
    })[]
}

export default function TableFooterWrapper({ items }: Props) {
    return (
        <>
            <TableFooter>
                <TableRow className="bg-background">
                    <TableCell colSpan={5} className="text-right">
                        Total (Excluded Vat)
                    </TableCell>
                    <TableCell className="text-right">
                        {items
                            .reduce(
                                (sum, item) =>
                                    sum +
                                    (100 / 107) *
                                        item.quantity *
                                        item.skuMasters.reduce(
                                            (sum, item) =>
                                                sum +
                                                item.goodsMasters.reduce(
                                                    (sum, item) =>
                                                        typeof item.price ===
                                                        'number'
                                                            ? sum + item?.price
                                                            : sum,
                                                    0
                                                ),
                                            0
                                        ),
                                0
                            )
                            .toFixed(2)}
                    </TableCell>
                </TableRow>
                <TableRow className="bg-background">
                    <TableCell colSpan={5} className="text-right">
                        Vat (7%)
                    </TableCell>
                    <TableCell className="text-right">
                        {items
                            .reduce(
                                (sum, item) =>
                                    sum +
                                    (7 / 107) *
                                        item.quantity *
                                        item.skuMasters.reduce(
                                            (sum, item) =>
                                                sum +
                                                item.goodsMasters.reduce(
                                                    (sum, item) =>
                                                        typeof item.price ===
                                                        'number'
                                                            ? sum + item?.price
                                                            : sum,
                                                    0
                                                ),
                                            0
                                        ),
                                0
                            )
                            .toFixed(2)}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell colSpan={5} className="text-right">
                        Total
                    </TableCell>
                    <TableCell className="text-right">
                        {items
                            .reduce(
                                (sum, item) =>
                                    sum +
                                    item.quantity *
                                        item.skuMasters.reduce(
                                            (sum, item) =>
                                                sum +
                                                item.goodsMasters.reduce(
                                                    (sum, item) =>
                                                        typeof item.price ===
                                                        'number'
                                                            ? sum + item?.price
                                                            : sum,
                                                    0
                                                ),
                                            0
                                        ),
                                0
                            )
                            .toLocaleString()}
                    </TableCell>
                </TableRow>
            </TableFooter>
        </>
    )
}
