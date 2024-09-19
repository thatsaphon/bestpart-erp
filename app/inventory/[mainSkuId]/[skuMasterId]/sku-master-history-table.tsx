import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table'
import { shortDateFormat } from '@/lib/date-format'
import { SkuMasterHistory } from '@/types/sku-tree/sku-history'
import React from 'react'

type Props = {
    histories: SkuMasterHistory[]
}

export default function SkuMasterHistoryTable({ histories }: Props) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Document No.</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price/Unit</TableHead>
                    <TableHead>Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {histories.map((history) => (
                    <TableRow key={history.documentNo}>
                        <TableCell>{shortDateFormat(history.date)}</TableCell>
                        <TableCell>{history.documentNo}</TableCell>
                        <TableCell>{history.documentType}</TableCell>
                        <TableCell>{history.Contact.name}</TableCell>
                        <TableCell>{history.quantity}</TableCell>
                        <TableCell>{`${history.pricePerUnit || history.costPerUnit}/${history.unit}(${history.quantityPerUnit})`}</TableCell>
                        <TableCell>
                            {(
                                history.quantity *
                                (history.pricePerUnit ||
                                    history.costPerUnit ||
                                    0)
                            ).toLocaleString()}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
