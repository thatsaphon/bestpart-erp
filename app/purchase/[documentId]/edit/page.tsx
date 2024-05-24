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
import TestCreateInvoice from '../../test/page'

type Props = { params: { documentId: string } }

export default async function EditPurchaseInvoicePage({
    params: { documentId },
}: Props) {
    const purchaseInvoices: {
        id: number
        date: Date
        documentId: string
        contactId: number
        contactName: string
        address: string
        phone: string
        taxId: string
        remark: string
        partNumber: string
        skuMasterId: number
        barcode: string
        name: string
        detail: string
        quantity: number
        price: number
        unit: string
        quantityPerUnit: number
    }[] = await prisma.$queryRaw`
        select "Document".id, "Document"."date", "Document"."documentId", "Contact"."id" as "contactId", "Document"."contactName", "Document"."address", "Document".phone, "Document"."taxId", "Document"."remark",
        "SkuIn".barcode, "MainSku"."partNumber", "SkuMaster"."id" as "skuMasterId", "MainSku"."name", "SkuMaster"."detail", "SkuIn".quantity, ("SkuIn".cost + "SkuIn".vat) as "price", "SkuIn".unit, "SkuIn"."quantityPerUnit" from "Document" 
        left join "ApSubledger" on "ApSubledger"."documentId" = "Document"."id"
        left join "Contact" on "Contact"."id" = "ApSubledger"."contactId"
        left join "Address" on "Address"."contactId" = "Contact"."id"
        left join "SkuIn" on "SkuIn"."documentId" = "Document"."id"
        left join "SkuMaster" on "SkuMaster"."id" = "SkuIn"."skuMasterId"
        left join "MainSku" on "MainSku"."id" = "SkuMaster"."mainSkuId"
        -- left join "_DocumentToGeneralLedger" on "_DocumentToGeneralLedger"."A" = "Document"."id"
        -- left join "GeneralLedger" on "GeneralLedger"."id" = "_DocumentToGeneralLedger"."B"
        where "Document"."documentId" = ${documentId}`

    return (
        <TestCreateInvoice
            defaultItems={purchaseInvoices}
            defaultDocumentDetails={purchaseInvoices[0]}
        />
    )
}
