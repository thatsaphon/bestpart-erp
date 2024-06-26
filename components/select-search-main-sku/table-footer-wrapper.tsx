'use client'

import React, { useEffect } from 'react'
import { TableFooter, TableRow, TableCell } from '../ui/table'
import { findGoodsMasterByBarcode } from '@/app/actions/inventory/goodsMaster/findGoodsMasterByBarcode'
import { Button } from '../ui/button'

type Props = {
    items: (Awaited<ReturnType<typeof findGoodsMasterByBarcode>> & {
        quantity: number
        rowId: string
        price?: number
    })[]
    setTotalRows: (totalRows: string[]) => void
    setItems: React.Dispatch<
        React.SetStateAction<
            (Awaited<ReturnType<typeof findGoodsMasterByBarcode>> & {
                quantity: number
                rowId: string
            })[]
        >
    >
}

export default function TableFooterWrapper({ items, setTotalRows }: Props) {
    return (
        <>
            <TableFooter>
                <TableRow className="bg-background">
                    <TableCell colSpan={5} className="text-right">
                        Total (Excluded Vat)
                    </TableCell>
                    <TableCell className="text-right">
                        {(+items
                            .reduce(
                                (sum, item) =>
                                    sum +
                                    (100 / 107) *
                                        item.quantity *
                                        (typeof item.price === 'number'
                                            ? item.price
                                            : item.SkuMaster.reduce(
                                                  (sum, item) =>
                                                      sum +
                                                      item.GoodsMaster.reduce(
                                                          (sum, item) =>
                                                              typeof item.price ===
                                                              'number'
                                                                  ? sum +
                                                                    item?.price
                                                                  : sum,
                                                          0
                                                      ),
                                                  0
                                              )),
                                0
                            )
                            .toFixed(2)).toLocaleString()}
                    </TableCell>
                </TableRow>
                <TableRow className="bg-background">
                    <TableCell colSpan={5} className="text-right">
                        Vat (7%)
                    </TableCell>
                    <TableCell className="text-right">
                        {(+items
                            .reduce(
                                (sum, item) =>
                                    sum +
                                    (7 / 107) *
                                        item.quantity *
                                        (typeof item.price === 'number'
                                            ? item.price
                                            : item.SkuMaster.reduce(
                                                  (sum, item) =>
                                                      sum +
                                                      item.GoodsMaster.reduce(
                                                          (sum, item) =>
                                                              typeof item.price ===
                                                              'number'
                                                                  ? sum +
                                                                    item?.price
                                                                  : sum,
                                                          0
                                                      ),
                                                  0
                                              )),
                                0
                            )
                            .toFixed(2)).toLocaleString()}
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
                                        (typeof item.price === 'number'
                                            ? item.price
                                            : item.SkuMaster.reduce(
                                                  (sum, item) =>
                                                      sum +
                                                      item.GoodsMaster.reduce(
                                                          (sum, item) =>
                                                              typeof item.price ===
                                                              'number'
                                                                  ? sum +
                                                                    item?.price
                                                                  : sum,
                                                          0
                                                      ),
                                                  0
                                              )),
                                0
                            )
                            .toLocaleString()}
                    </TableCell>
                </TableRow>
                <TableRow className="bg-background">
                    <TableCell colSpan={6} className="space-x-1 text-right">
                        <Button type="button" variant={'outline'}>
                            Print
                        </Button>
                        <Button type="button" variant={'destructive'}>
                            Cancel
                        </Button>
                        <Button>Submit</Button>
                    </TableCell>
                </TableRow>
            </TableFooter>
        </>
    )
}
