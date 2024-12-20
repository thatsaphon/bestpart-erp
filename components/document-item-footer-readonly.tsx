import React from 'react'
import { TableRow, TableCell } from './ui/table'
import { DocumentItem } from '@/types/document-item'

type Props = {
    documentItems: DocumentItem[]
    isIncludeVat: boolean
    vatable: boolean
    colSpan?: number
}

export default function DocumentItemFooterReadonly({
    documentItems,
    isIncludeVat,
    vatable,
    colSpan = 6,
}: Props) {
    return (
        <>
            {vatable && (
                <React.Fragment>
                    <TableRow>
                        <TableCell colSpan={colSpan - 2} className="text-right">
                            {isIncludeVat
                                ? 'ราคารวมภาษีมูลค่าเพิ่ม'
                                : 'ราคาไม่รวมภาษีมูลค่าเพิ่ม'}
                        </TableCell>
                        <TableCell colSpan={1} className="text-right">
                            ยอดก่อนภาษี
                        </TableCell>
                        <TableCell colSpan={1} className="text-right">
                            {documentItems
                                .reduce(
                                    (sum, item) =>
                                        sum +
                                        (item.costPerUnitExVat! -
                                            (item.discountPerUnitExVat || 0))! *
                                            item.quantity,
                                    0
                                )
                                .toLocaleString()}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={colSpan - 1} className="text-right">
                            ภาษีมูลค่าเพิ่ม
                        </TableCell>
                        <TableCell colSpan={1} className="text-right">
                            {documentItems
                                .reduce(
                                    (sum, item) =>
                                        sum + item.vat! * item.quantity,
                                    0
                                )
                                .toLocaleString()}
                        </TableCell>
                    </TableRow>
                </React.Fragment>
            )}
            <TableRow>
                <TableCell colSpan={colSpan - 1} className="text-right">
                    ยอดรวม
                </TableCell>
                <TableCell className="text-right">
                    {Math.abs(
                        Number(
                            documentItems.reduce(
                                (sum, item) =>
                                    sum +
                                    (item.costPerUnitIncVat! -
                                        (item.discountPerUnitIncVat || 0)) *
                                        item.quantity,
                                0
                            )
                        )
                    ).toLocaleString()}
                </TableCell>
            </TableRow>
        </>
    )
}
