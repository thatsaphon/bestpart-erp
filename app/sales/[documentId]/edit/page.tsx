import prisma from '@/app/db/db'
import React from 'react'
import CreateOrUpdateSalesInvoiceComponent from '../../create/create-update-sales-invoice-component'
import {
    DocumentRemark,
    MainSkuRemark,
    Prisma,
    SkuMasterRemark,
} from '@prisma/client'

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
        documentRemarks: DocumentRemark[]
        mainSkuId: number
        partNumber: string
        skuMasterId: number
        goodsMasterId: number
        barcode: string
        name: string
        detail: string
        MainSkuRemarks?: MainSkuRemark[]
        SkuMasterRemarks?: SkuMasterRemark[]
        quantity: number
        price: number
        unit: string
        quantityPerUnit: number
    }[] = await prisma.$queryRaw`
        select "Document".id, "Document"."date", "Document"."documentId", "ArSubledger"."contactId" as "contactId", "Document"."contactName", "Document"."address", "Document".phone, "Document"."taxId",
        "SkuOut".barcode, "SkuOut"."skuMasterId", "SkuOut"."goodsMasterId", "MainSku"."mainSkuId", "MainSku"."partNumber", "SkuMaster"."id" as "skuMasterId", "MainSku"."name", "SkuMaster"."detail", "SkuOut".quantity, ("SkuOut".price + "SkuOut".vat) as "price", "SkuOut".unit, "SkuOut"."quantityPerUnit" from "Document" 
        left join "ArSubledger" on "ArSubledger"."documentId" = "Document"."id"
        left join "Contact" on "Contact"."id" = "ArSubledger"."contactId"
        -- left join "Address" on "Address"."contactId" = "Contact"."id"
        left join "SkuOut" on "SkuOut"."documentId" = "Document"."id"
        left join "SkuMaster" on "SkuMaster"."id" = "SkuOut"."skuMasterId"
        left join "MainSku" on "MainSku"."id" = "SkuMaster"."mainSkuId"
        where "Document"."documentId" = ${documentId}`

    const mainSkuRemarks = await prisma.$queryRaw<
        (MainSkuRemark & { mainSkuId: number })[]
    >`select "MainSkuRemark".*, "MainSku"."id" as "mainSkuId" from "MainSkuRemark" 
                    left join "_MainSkuToMainSkuRemark" on "_MainSkuToMainSkuRemark"."B" = "MainSkuRemark"."id"
                    left join "MainSku" on "MainSku"."id" = "_MainSkuToMainSkuRemark"."A"
                    where "MainSku"."id" in (${Prisma.join(salesInvoices.map((x) => x.mainSkuId))})`

    const skuMasterRemarks = await prisma.$queryRaw<
        (SkuMasterRemark & { skuMasterId: number })[]
    >`select "SkuMasterRemark".*, "SkuMaster"."id" as "skuMasterId" from "SkuMasterRemark"
                    left join "_SkuMasterToSkuMasterRemark" on "_SkuMasterToSkuMasterRemark"."B" = "SkuMasterRemark"."id"
                    left join "SkuMaster" on "SkuMaster"."id" = "_SkuMasterToSkuMasterRemark"."A"
                    where "SkuMaster"."id" in (${Prisma.join(salesInvoices.map((x) => x.skuMasterId))})`

    const images: { skuMasterId: number; images: string }[] = await prisma.$queryRaw`
    select "SkuMaster".id as "skuMasterId", "SkuMasterImage"."path" as "images" from "SkuMaster" 
    left join "SkuMasterImage" on "SkuMaster"."id" = "SkuMasterImage"."skuMasterId" 
    where "SkuMaster"."id" in (${Prisma.join(salesInvoices.map(({ skuMasterId }) => skuMasterId))})`

    return (
        <CreateOrUpdateSalesInvoiceComponent
            defaultItems={salesInvoices.map((x) => ({
                ...x,
                MainSkuRemarks: mainSkuRemarks.filter(
                    (y) => y.mainSkuId === x.mainSkuId
                ),
                SkuMasterRemarks: skuMasterRemarks.filter(
                    (y) => y.skuMasterId === x.skuMasterId
                ),
                images: images
                    .filter((y) => y.skuMasterId === x.skuMasterId)
                    .map((y) => y.images),
            }))}
            defaultDocumentDetails={salesInvoices[0]}
        />
    )
}
