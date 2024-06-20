import prisma from '@/app/db/db'
import React from 'react'
import CreateOrUpdateSalesInvoiceComponent from '../../create/create-update-sales-invoice-component'
import {
    DocumentRemark,
    MainSkuRemark,
    PaymentStatus,
    Prisma,
    SkuMasterRemark,
} from '@prisma/client'
import { getPaymentMethods } from '@/app/actions/accounting'
import Link from 'next/link'

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
        paymentStatus: PaymentStatus
    }[] = await prisma.$queryRaw`
        select "Document".id, "Document"."date", "Document"."documentId", "ArSubledger"."contactId" as "contactId", "Document"."contactName", "Document"."address", "Document".phone, "Document"."taxId",
        "SkuOut".barcode, "SkuOut"."skuMasterId", "SkuOut"."goodsMasterId", "SkuMaster"."mainSkuId", "MainSku"."partNumber", "SkuMaster"."id" as "skuMasterId", 
        "MainSku"."name", "SkuMaster"."detail", "SkuOut".quantity, ("SkuOut".price + "SkuOut".vat) as "price", "SkuOut".unit, "SkuOut"."quantityPerUnit", "ArSubledger"."paymentStatus" 
        from "Document"
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

    const images: { skuMasterId: number; images: string }[] =
        await prisma.$queryRaw`
    select "SkuMaster".id as "skuMasterId", "SkuMasterImage"."path" as "images" from "SkuMaster" 
    left join "SkuMasterImage" on "SkuMaster"."id" = "SkuMasterImage"."skuMasterId" 
    where "SkuMaster"."id" in (${Prisma.join(salesInvoices.map(({ skuMasterId }) => skuMasterId))})`

    const paymentMethods = await getPaymentMethods()

    const defaultPayments = await prisma.generalLedger.findMany({
        where: {
            Document: { some: { id: salesInvoices[0].id } },
            AND: [
                { chartOfAccountId: { gte: 11000 } },
                { chartOfAccountId: { lte: 12000 } },
            ],
        },
        select: {
            chartOfAccountId: true,
            amount: true,
        },
    })

    const defaultRemarks = await prisma.documentRemark.findMany({
        where: { documentId: salesInvoices[0].id },
    })

    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/sales/${documentId}`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>

                {/* <Link href="/sales/create">
                    <Button
                        variant="ghost"
                        className="mb-2"
                    >{`Create New`}</Button>
                </Link> */}
            </div>
            <h1 className="my-2 text-3xl transition-colors">
                แก้ไขรายละเอียดบิลขาย
            </h1>
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
                paymentMethods={paymentMethods}
                defaultPayments={defaultPayments.map((x) => ({
                    id: x.chartOfAccountId,
                    amount: x.amount,
                }))}
                defaultRemarks={defaultRemarks}
            />
        </>
    )
}
