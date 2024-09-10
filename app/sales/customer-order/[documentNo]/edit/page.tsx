import React from 'react'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import Link from 'next/link'
import { Metadata } from 'next'
import {
    DocumentRemark,
    MainSkuRemark,
    PaymentStatus,
    Prisma,
    SkuMasterRemark,
} from '@prisma/client'
import prisma from '@/app/db/db'
import CreateOrUpdateCustomerOrderComponent from '../../create/create-update-customer-order-component'

type Props = {
    params: {
        documentNo: string
    }
}

export const metadata: Metadata = {
    title: 'สร้างบิลขาย',
}

export default async function UpdateCustomerOrderPage({
    params: { documentNo },
}: Props) {
    const customerOrder: {
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
        description: string
    }[] = await prisma.$queryRaw`
        select "Document".id, "Document"."date", "Document"."documentNo", "CustomerOrder"."contactId" as "contactId", "Document"."contactName", 
        "Document"."address", "Document".phone, "Document"."taxId", "CustomerOrderItem".barcode, "CustomerOrderItem"."description",
        "CustomerOrderItem".quantity, ("CustomerOrderItem".price) as "price", "CustomerOrderItem".unit, "CustomerOrderItem"."quantityPerUnit"
        from "Document"
        left join "CustomerOrder" on "CustomerOrder"."documentId" = "Document"."id"
        left join "Contact" on "Contact"."id" = "CustomerOrder"."contactId"
        left join "CustomerOrderItem" on "CustomerOrderItem"."customerOrderId" = "CustomerOrder"."id"
        where "Document"."documentNo" = ${documentNo}`

    const deposits = await prisma.generalLedger.findMany({
        where: {
            Document: { every: { documentNo: documentNo } },
            chartOfAccountId: { not: 22300 },
        },
        select: {
            chartOfAccountId: true,
            amount: true,
        },
    })

    const defaultRemarks = await prisma.documentRemark.findMany({
        where: { documentId: customerOrder[0].id },
    })
    console.log(customerOrder)
    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/sales/customer-order`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">สร้างใบเสนอราคา</h1>
            <CreateOrUpdateCustomerOrderComponent
                defaultItems={customerOrder.map((x) => ({
                    ...x,
                    // MainSkuRemarks: mainSkuRemarks.filter(
                    //     (y) => y.mainSkuId === x.mainSkuId
                    // ),
                    // SkuMasterRemarks: skuMasterRemarks.filter(
                    //     (y) => y.skuMasterId === x.skuMasterId
                    // ),
                    // images: images
                    //     .filter((y) => y.skuMasterId === x.skuMasterId)
                    //     .map((y) => y.images),
                }))}
                paymentMethods={await getPaymentMethods()}
                defaultDocumentDetails={customerOrder[0]}
                defaultRemarks={defaultRemarks}
                defaultPayments={deposits.map((x) => ({
                    id: x.chartOfAccountId,
                    amount: x.amount,
                }))}
            />
        </>
    )
}
