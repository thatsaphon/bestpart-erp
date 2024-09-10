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
import { salesItemsToDocumentItems } from '@/types/sales/sales-item'
import { purchaseItemsToInventoryDetailType } from '@/types/purchase/purchase-item'
import { getPurchaseDefaultFunction } from '@/types/purchase/purchase'

type Props = { params: { documentNo: string } }

export default async function EditPurchaseInvoicePage({
    params: { documentNo },
}: Props) {
    const [purchaseInvoice] = await getPurchaseDefaultFunction({
        documentNo,
        type: 'Purchase',
    })
    if (!purchaseInvoice) return null

    return (
        <>
            {' '}
            <div className="flex justify-between">
                <Link
                    href={`/purchase/purchase-received/${documentNo}`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">สร้างบิลซื้อ</h1>
            <CreateOrUpdatePurchaseInvoiceComponent
                purchase={purchaseInvoice}
            />
        </>
    )
}
