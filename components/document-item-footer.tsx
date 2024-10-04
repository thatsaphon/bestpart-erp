import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import React from 'react'
import AddPaymentComponent from './add-payment-component'
import CreateDocumentRemark from './create-document-remark'
import { TableRow, TableCell } from './ui/table'
import { DocumentItem } from '@/types/document-item'

type Props = {
    vatable: boolean
    setVatable: React.Dispatch<React.SetStateAction<boolean>>
    isIncludeVat: boolean
    setIsIncludeVat: React.Dispatch<React.SetStateAction<boolean>>
    items: DocumentItem[]
}

export default function DocumentItemFooter({
    vatable,
    setVatable,
    isIncludeVat,
    setIsIncludeVat,
    items,
}: Props) {
    return (
        <>
            {vatable && (
                <React.Fragment>
                    <TableRow>
                        <TableCell colSpan={4} className="text-right">
                            <div className="flex w-full items-center justify-end space-x-2">
                                <Switch
                                    id="vatable"
                                    checked={vatable}
                                    onCheckedChange={setVatable}
                                />
                                <Label htmlFor="vatable">
                                    มีภาษีมูลค่าเพิ่ม
                                </Label>
                                <Switch
                                    id="inclued-vat"
                                    checked={isIncludeVat}
                                    onCheckedChange={setIsIncludeVat}
                                    disabled={!vatable}
                                />
                                <Label htmlFor="inclued-vat">รวมภาษี</Label>
                            </div>
                        </TableCell>
                        <TableCell colSpan={1} className="w-36 text-right">
                            ราคาก่อนภาษี
                        </TableCell>
                        <TableCell className="w-36 text-right">
                            {(+items
                                .reduce(
                                    (sum, item) =>
                                        isIncludeVat
                                            ? sum +
                                              item.pricePerUnit *
                                                  item.quantity *
                                                  (100 / 107)
                                            : sum +
                                              item.pricePerUnit * item.quantity,
                                    0
                                )
                                .toFixed(2)).toLocaleString()}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={5} className="w-36 text-right">
                            ภาษีมูลค่าเพิ่ม
                        </TableCell>
                        <TableCell className="w-36 text-right">
                            {(+items
                                .reduce(
                                    (sum, item) =>
                                        isIncludeVat
                                            ? sum +
                                              item.pricePerUnit *
                                                  item.quantity *
                                                  (7 / 107)
                                            : sum +
                                              item.pricePerUnit *
                                                  item.quantity *
                                                  (7 / 100),
                                    0
                                )
                                .toFixed(2)).toLocaleString()}
                        </TableCell>
                    </TableRow>
                </React.Fragment>
            )}
            <TableRow>
                <TableCell colSpan={4} className="text-right">
                    {!vatable && (
                        <div className="flex w-full items-center justify-end space-x-2">
                            <Switch
                                id="vatable"
                                checked={vatable}
                                onCheckedChange={setVatable}
                            />
                            <Label htmlFor="vatable">มีภาษีมูลค่าเพิ่ม</Label>
                            <Switch
                                id="inclued-vat"
                                checked={isIncludeVat}
                                onCheckedChange={setIsIncludeVat}
                                disabled={!vatable}
                            />
                            <Label htmlFor="inclued-vat">รวมภาษี</Label>
                        </div>
                    )}
                </TableCell>
                <TableCell colSpan={1} className="w-36 text-right">
                    รวม
                </TableCell>
                <TableCell className="w-36 text-right">
                    {(+(
                        items.reduce(
                            (sum, item) =>
                                sum + item.pricePerUnit * item.quantity,
                            0
                        ) * (!vatable ? 1 : isIncludeVat ? 1 : 1.07)
                    ).toFixed(2)).toLocaleString()}
                </TableCell>
            </TableRow>
        </>
    )
}
