import React from 'react'
import { getPaymentMethods } from '@/app/actions/accounting'
import Link from 'next/link'
import { Metadata } from 'next'
import CreateOrUpdateQuotationComponent from '../../create/create-update-quotation-component'
import {
    DocumentRemark,
    MainSkuRemark,
    PaymentStatus,
    Prisma,
    SkuMasterRemark,
} from '@prisma/client'
import prisma from '@/app/db/db'

type Props = {
    params: {
        documentNo: string
    }
}

export const metadata: Metadata = {
    title: 'สร้างบิลขาย',
}

export default async function UpdateQuotationPage({
    params: { documentNo },
}: Props) {
    const quotation: {
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
        select "Document".id, "Document"."date", "Document"."documentNo", "Quotation"."contactId" as "contactId", "Document"."contactName", 
        "Document"."address", "Document".phone, "Document"."taxId", "QuotationItem".barcode, "QuotationItem"."skuMasterId", "QuotationItem"."goodsMasterId", "SkuMaster"."mainSkuId", 
        "MainSku"."partNumber", "SkuMaster"."id" as "skuMasterId", "MainSku"."name", "SkuMaster"."detail", 
        "QuotationItem".quantity, ("QuotationItem".price + "QuotationItem".vat) as "price", "QuotationItem".unit, "QuotationItem"."quantityPerUnit"
        from "Document"
        left join "Quotation" on "Quotation"."documentId" = "Document"."id"
        left join "Contact" on "Contact"."id" = "Quotation"."contactId"
        left join "QuotationItem" on "QuotationItem"."quotationId" = "Quotation"."id"
        left join "SkuMaster" on "SkuMaster"."id" = "QuotationItem"."skuMasterId"
        left join "MainSku" on "MainSku"."id" = "SkuMaster"."mainSkuId"
        where "Document"."documentNo" = ${documentNo}`

    const mainSkuRemarks = await prisma.$queryRaw<
        (MainSkuRemark & { mainSkuId: number })[]
    >`select "MainSkuRemark".*, "MainSku"."id" as "mainSkuId" from "MainSkuRemark" 
            left join "_MainSkuToMainSkuRemark" on "_MainSkuToMainSkuRemark"."B" = "MainSkuRemark"."id"
            left join "MainSku" on "MainSku"."id" = "_MainSkuToMainSkuRemark"."A"
            where "MainSku"."id" in (${Prisma.join(quotation.map((x) => x.mainSkuId))})`

    const skuMasterRemarks = await prisma.$queryRaw<
        (SkuMasterRemark & { skuMasterId: number })[]
    >`select "SkuMasterRemark".*, "SkuMaster"."id" as "skuMasterId" from "SkuMasterRemark"
            left join "_SkuMasterToSkuMasterRemark" on "_SkuMasterToSkuMasterRemark"."B" = "SkuMasterRemark"."id"
            left join "SkuMaster" on "SkuMaster"."id" = "_SkuMasterToSkuMasterRemark"."A"
            where "SkuMaster"."id" in (${Prisma.join(quotation.map((x) => x.skuMasterId))})`

    const images: { skuMasterId: number; images: string }[] =
        await prisma.$queryRaw`
    select "SkuMaster".id as "skuMasterId", "SkuMasterImage"."path" as "images" from "SkuMaster" 
    left join "SkuMasterImage" on "SkuMaster"."id" = "SkuMasterImage"."skuMasterId" 
    where "SkuMaster"."id" in (${Prisma.join(quotation.map(({ skuMasterId }) => skuMasterId))})`

    const defaultRemarks = await prisma.documentRemark.findMany({
        where: { documentId: quotation[0].id },
    })

    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/sales/quotation`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">สร้างใบเสนอราคา</h1>
            <CreateOrUpdateQuotationComponent
                defaultItems={quotation.map((x) => ({
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
                defaultDocumentDetails={quotation[0]}
                defaultRemarks={defaultRemarks}
            />
        </>
    )
}
