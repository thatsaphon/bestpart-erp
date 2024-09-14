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

type Props = { params: { documentNo: string } }

export default async function EditPurchaseOrderPage({
    params: { documentNo },
}: Props) {
    const [purchaseOrder] = await getPurchaseOrderDefaultFunction({
        documentNo,
        type: 'PurchaseOrder',
    })
    if (!purchaseOrder) return null

    // const openCustomerOrders = await getCustomerOrderDefaultFunction({
    //     CustomerOrder: { status: { in: ['Open'] } },
    // })

    // const existingCustomerOrders = await getCustomerOrderDefaultFunction({
    //     CustomerOrder: {
    //         id: {
    //             in: purchaseOrder.PurchaseOrder?.CustomerOrderLink?.map(
    //                 (customerOrder) => customerOrder.id
    //             ),
    //         },
    //     },
    // })

    return (
        <>
            {' '}
            <div className="flex justify-between">
                <Link
                    href={`/purchase/purchase-received/${documentNo}`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">แก้ไขใบสั่งซื้อ</h1>
            <CreateOrUpdatePurchaseOrderComponent
                existingPurchaseOrder={purchaseOrder}
                // openCustomerOrders={openCustomerOrders}
                // existingCustomerOrders={existingCustomerOrders}
            />
        </>
    )
}
