import prisma from '@/app/db/db'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Cross1Icon } from '@radix-ui/react-icons'
import React from 'react'

type Props = { params: { documentId: string } }

export default async function EditPurchaseInvoicePage({
    params: { documentId },
}: Props) {
    const purchaseInvoices: {
        date: Date
        contactId: number
        contactName: string
        address: string
        phone: string
        taxId: string
        remark: string
        barcode: string
        name: string
        detail: string
        quantity: number
        price: number
        unit: string
        quantityPerUnit: number
    }[] = await prisma.$queryRaw`
        select "Document"."date", "Contact"."id" as "contactId", "Document"."contactName", "Document"."address", "Document".phone, "Document"."taxId", "Document"."remark",
        "SkuIn".barcode, "MainSku"."name", "SkuMaster"."detail", "SkuIn".quantity, ("SkuIn".cost + "SkuIn".vat) as "price", "SkuIn".unit, "SkuIn"."quantityPerUnit" from "Document" 
        left join "ApSubledger" on "ApSubledger"."documentId" = "Document"."id"
        left join "Contact" on "Contact"."id" = "ApSubledger"."contactId"
        left join "Address" on "Address"."contactId" = "Contact"."id"
        left join "SkuIn" on "SkuIn"."documentId" = "Document"."id"
        left join "SkuMaster" on "SkuMaster"."id" = "SkuIn"."skuMasterId"
        left join "MainSku" on "MainSku"."id" = "SkuMaster"."mainSkuId"
        -- left join "_DocumentToGeneralLedger" on "_DocumentToGeneralLedger"."A" = "Document"."id"
        -- left join "GeneralLedger" on "GeneralLedger"."id" = "_DocumentToGeneralLedger"."B"
        where "Document"."documentId" = ${documentId}`

    console.log(purchaseInvoices)

    return (
        <div className="p-3">
            <Button variant="ghost">{`< Back`}</Button>
            <Table>
                <TableCaption>{purchaseInvoices[0].remark}</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Barcode</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {purchaseInvoices.map((purchaseInvoice) => (
                        <TableRow key={purchaseInvoice.barcode}>
                            <TableCell>{purchaseInvoice.barcode}</TableCell>
                            <TableCell>
                                <p>{purchaseInvoice.name}</p>
                                <p className="text-primary/50">
                                    {purchaseInvoice.detail}
                                </p>
                            </TableCell>
                            <TableCell className="text-right">
                                {purchaseInvoice.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                                {purchaseInvoice.unit}
                            </TableCell>
                            <TableCell className="text-right">
                                {purchaseInvoice.price /
                                    purchaseInvoice.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                                {purchaseInvoice.price}
                            </TableCell>
                            <TableCell className="text-right">
                                <Cross1Icon className="font-bold text-destructive hover:cursor-pointer" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={5} className="text-right">
                            Total
                        </TableCell>
                        <TableCell className="text-right">
                            {purchaseInvoices.reduce((a, b) => a + b.price, 0)}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}
