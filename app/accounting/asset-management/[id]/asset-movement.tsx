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
                            <TableCell>{assetMovement.value}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell colSpan={4}>
                            <div className="flex w-full justify-center">
                                <AddAssetMovementDialog assetId={asset.id} />
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </>
    )
}
