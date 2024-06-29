import prisma from '@/app/db/db'
import React, { Suspense } from 'react'
import CreateOrUpdatePurchaseInvoiceComponent from '../../create/create-update-purchase-invoice-component'
import {
    DocumentRemark,
    MainSkuRemark,
    Prisma,
    SkuMasterRemark,
} from '@prisma/client'
import Link from 'next/link'

type Props = { params: { documentNo: string } }

export default async function EditPurchaseInvoicePage({
    params: { documentNo },
}: Props) {
    const purchaseInvoices: {
        id: number
        date: Date
        documentNo: string
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
        select "Document".id, "Document"."date", "Document"."documentNo", "Contact"."id" as "contactId", "Document"."contactName", "Document"."address", "Document".phone, "Document"."taxId",
        "SkuIn".barcode, "SkuIn"."skuMasterId", "SkuIn"."goodsMasterId", "MainSku"."id" as "mainSkuId", "MainSku"."partNumber", "SkuMaster"."id" as "skuMasterId", "MainSku"."name", "SkuMaster"."detail", "SkuIn".quantity, ("SkuIn".cost + "SkuIn".vat) as "price", "SkuIn".unit, "SkuIn"."quantityPerUnit" from "Document" 
        left join "ApSubledger" on "ApSubledger"."documentNo" = "Document"."id"
        left join "Contact" on "Contact"."id" = "ApSubledger"."contactId"
        left join "SkuIn" on "SkuIn"."documentNo" = "Document"."id"
        left join "SkuMaster" on "SkuMaster"."id" = "SkuIn"."skuMasterId"
        left join "MainSku" on "MainSku"."id" = "SkuMaster"."mainSkuId"
        where "Document"."documentNo" = ${documentNo}`

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
                            where "MainSku"."id" in (${Prisma.join(purchaseInvoices.map((x) => x.mainSkuId))})`

    const skuMasterRemarks = await prisma.$queryRaw<
        (SkuMasterRemark & { skuMasterId: number })[]
    >`select "SkuMasterRemark".*, "SkuMaster"."id" as "skuMasterId" from "SkuMasterRemark"
                            left join "_SkuMasterToSkuMasterRemark" on "_SkuMasterToSkuMasterRemark"."B" = "SkuMasterRemark"."id"
                            left join "SkuMaster" on "SkuMaster"."id" = "_SkuMasterToSkuMasterRemark"."A"
                            where "SkuMaster"."id" in (${Prisma.join(purchaseInvoices.map((x) => x.skuMasterId))})`

    const images: { skuMasterId: number; images: string }[] =
        await prisma.$queryRaw`
        select "SkuMaster".id as "skuMasterId", "SkuMasterImage"."path" as "images" from "SkuMaster" 
        left join "SkuMasterImage" on "SkuMaster"."id" = "SkuMasterImage"."skuMasterId" 
        where "SkuMaster"."id" in (${Prisma.join(purchaseInvoices.map(({ skuMasterId }) => skuMasterId))})`

    return (
        <>
            {' '}
            <div className="flex justify-between">
                <Link
                    href={`/purchase/${documentNo}`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">สร้างบิลซื้อ</h1>
            <CreateOrUpdatePurchaseInvoiceComponent
                defaultItems={purchaseInvoices.map((x) => ({
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
                defaultDocumentDetails={purchaseInvoices[0]}
            />{' '}
        </>
    )
}
