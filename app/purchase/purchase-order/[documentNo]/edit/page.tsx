import prisma from '@/app/db/db'
import React, { Suspense } from 'react'
import {
    DocumentRemark,
    MainSkuRemark,
    Prisma,
    SkuMasterRemark,
} from '@prisma/client'
import Link from 'next/link'
import { salesItemsToDocumentItems } from '@/types/sales/sales-item'
import { purchaseItemsToDocumentItems } from '@/types/purchase/purchase-item'
import { getPurchaseDefaultFunction } from '@/types/purchase/purchase'
import CreateOrUpdatePurchaseOrderComponent from '../../create/create-update-purchase-order-component'
import { getPurchaseOrderDefaultFunction } from '@/types/purchase-order/purchase-order'
import { getCustomerOrderDefaultFunction } from '@/types/customer-order/customer-order'

type Props = { params: Promise<{ documentNo: string }> }

export default async function EditPurchaseOrderPage(props: Props) {
    const params = await props.params;

    const {
        documentNo
    } = params;

    const [purchaseOrder] = await getPurchaseOrderDefaultFunction({
        documentNo,
        type: 'PurchaseOrder',
    })
    if (!purchaseOrder) return null
    const customerOrders = await getCustomerOrderDefaultFunction({
        OR: [
            { CustomerOrder: { status: { in: ['Pending'] } } },
            {
                id: {
                    in: purchaseOrder?.PurchaseOrder?.CustomerOrder.map(
                        (customerOrder) => customerOrder.documentId
                    ),
                },
            },
        ],
    })

    return (
        <>
            <h1 className="my-2 text-3xl transition-colors">แก้ไขใบสั่งซื้อ</h1>
            <CreateOrUpdatePurchaseOrderComponent
                existingPurchaseOrder={purchaseOrder}
                pendingOrExistingCustomerOrders={customerOrders}
            />
        </>
    )
}
