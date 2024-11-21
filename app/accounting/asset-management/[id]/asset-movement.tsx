import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
    TableFooter,
    TableBody,
} from '@/components/ui/table'
import { shortDateFormat } from '@/lib/date-format'
import { GetAsset } from '@/types/asset/asset'
import { PlusCircleIcon } from 'lucide-react'
import React from 'react'
import AddAssetMovementDialog from './add-asset-movement-dialog'

type Props = {
    asset: GetAsset
}

export default function AssetMovement({ asset }: Props) {
    return (
        <>
            <div className="p-2">
                <AddAssetMovementDialog assetId={asset.id} />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>DocumentNo</TableHead>
                        <TableHead>รายการ</TableHead>
                        <TableHead>มูลค่า</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {asset.AssetMovement.map((assetMovement) => (
                        <TableRow key={assetMovement.id}>
                            <TableCell>
                                {shortDateFormat(assetMovement.date)}
                            </TableCell>
                            <TableCell>
                                {
                                    (
                                        assetMovement.JournalVoucher ||
                                        assetMovement.OtherInvoice
                                    )?.Document.documentNo
                                }
                            </TableCell>
                            <TableCell>{assetMovement.description}</TableCell>
                            <TableCell>
                                {assetMovement.value.toLocaleString()}
                            </TableCell>
                        </TableRow>
                    ))}
                    {/* <TableRow>
                        <TableCell colSpan={4}>
                            <div className="flex w-full justify-center">
                                <AddAssetMovementDialog assetId={asset.id} />
                            </div>
                        </TableCell>
                    </TableRow> */}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3} className="text-right">
                            รวม
                        </TableCell>
                        <TableCell>
                            {asset.AssetMovement.reduce(
                                (a, b) => a + b.value,
                                0
                            ).toLocaleString()}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </>
    )
}
