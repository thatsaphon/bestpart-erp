import prisma from '@/app/db/db'
import React from 'react'
import CreateOrUpdatePurchaseInvoiceComponent from '../../create/create-update-purchase-invoice-component'
import {
    DocumentRemark,
    MainSkuRemark,
    Prisma,
    SkuMasterRemark,
} from '@prisma/client'

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
        select "Document".id, "Document"."date", "Document"."documentId", "Contact"."id" as "contactId", "Document"."contactName", "Document"."address", "Document".phone, "Document"."taxId",
        "SkuIn".barcode, "SkuIn"."skuMasterId", "SkuIn"."goodsMasterId", "MainSku"."id" as "mainSkuId", "MainSku"."partNumber", "SkuMaster"."id" as "skuMasterId", "MainSku"."name", "SkuMaster"."detail", "SkuIn".quantity, ("SkuIn".cost + "SkuIn".vat) as "price", "SkuIn".unit, "SkuIn"."quantityPerUnit" from "Document" 
        left join "ApSubledger" on "ApSubledger"."documentId" = "Document"."id"
        left join "Contact" on "Contact"."id" = "ApSubledger"."contactId"
        left join "SkuIn" on "SkuIn"."documentId" = "Document"."id"
        left join "SkuMaster" on "SkuMaster"."id" = "SkuIn"."skuMasterId"
        left join "MainSku" on "MainSku"."id" = "SkuMaster"."mainSkuId"
        where "Document"."documentId" = ${documentId}`

    purchaseInvoices[0].documentRemarks = await prisma.documentRemark.findMany({
        where: {
            documentId: purchaseInvoices[0].id,
        },
    })

    const mainSkuRemarks = await prisma.$queryRaw<
        (MainSkuRemark & { mainSkuId: number })[]
    >`select "MainSkuRemark".*, "MainSku"."id" as "mainSkuId" from "MainSkuRemark" 
                            left join "_MainSkuToMainSkuRemark" on "_MainSkuToMainSkuRemark"."B" = "MainSkuRemark"."id"
                            left join "MainSku" on "MainSku"."id" = "_MainSkuToMainSkuRemark"."A"
                            where "MainSku"."id" = (${Prisma.join(purchaseInvoices.map((x) => x.mainSkuId))})`

    const skuMasterRemarks = await prisma.$queryRaw<
        (SkuMasterRemark & { skuMasterId: number })[]
    >`select "SkuMasterRemark".*, "SkuMaster"."id" as "skuMasterId" from "SkuMasterRemark"
                            left join "_SkuMasterToSkuMasterRemark" on "_SkuMasterToSkuMasterRemark"."B" = "SkuMasterRemark"."id"
                            left join "SkuMaster" on "SkuMaster"."id" = "_SkuMasterToSkuMasterRemark"."A"
                            where "SkuMaster"."id" = (${Prisma.join(purchaseInvoices.map((x) => x.skuMasterId))})`

    return (
        <CreateOrUpdatePurchaseInvoiceComponent
            defaultItems={purchaseInvoices.map((x) => ({
                ...x,
                MainSkuRemarks: mainSkuRemarks.filter(
                    (y) => y.mainSkuId === x.mainSkuId
                ),
                SkuMasterRemarks: skuMasterRemarks.filter(
                    (y) => y.skuMasterId === x.skuMasterId
                ),
            }))}
            defaultDocumentDetails={purchaseInvoices[0]}
        />
    )
}
