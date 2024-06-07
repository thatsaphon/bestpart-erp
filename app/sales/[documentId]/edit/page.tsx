import prisma from '@/app/db/db'
import React from 'react'
import CreateOrUpdateSalesInvoiceComponent from '../../create/create-update-sales-invoice-component'

type Props = { params: { documentId: string } }

export default async function EditSalesInvoicePage({
    params: { documentId },
}: Props) {
    const salesInvoices: {
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
        goodsMasterId: number
        barcode: string
        name: string
        detail: string
        quantity: number
        price: number
        unit: string
        quantityPerUnit: number
    }[] = await prisma.$queryRaw`
        select "Document".id, "Document"."date", "Document"."documentId", "ArSubledger"."contactId" as "contactId", "Document"."contactName", "Document"."address", "Document".phone, "Document"."taxId",
        "SkuOut".barcode, "SkuOut"."skuMasterId", "SkuOut"."goodsMasterId", "MainSku"."partNumber", "SkuMaster"."id" as "skuMasterId", "MainSku"."name", "SkuMaster"."detail", "SkuOut".quantity, ("SkuOut".price + "SkuOut".vat) as "price", "SkuOut".unit, "SkuOut"."quantityPerUnit" from "Document" 
        left join "ArSubledger" on "ArSubledger"."documentId" = "Document"."id"
        left join "Contact" on "Contact"."id" = "ArSubledger"."contactId"
        -- left join "Address" on "Address"."contactId" = "Contact"."id"
        left join "SkuOut" on "SkuOut"."documentId" = "Document"."id"
        left join "SkuMaster" on "SkuMaster"."id" = "SkuOut"."skuMasterId"
        left join "MainSku" on "MainSku"."id" = "SkuMaster"."mainSkuId"
        where "Document"."documentId" = ${documentId}`

    return (
        <CreateOrUpdateSalesInvoiceComponent
            defaultItems={salesInvoices}
            defaultDocumentDetails={salesInvoices[0]}
        />
    )
}
