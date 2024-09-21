'use server'

import { addDocumentRemark } from '@/actions/add-document-remark'
import prisma from '@/app/db/db'
import { PurchaseOrderStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { purchaseOrderStatus } from '@/types/purchase-order/purchase-order-status'

export const updatePurchaseOrderStatus = async (
    purchaseOrderId: number,
    status: PurchaseOrderStatus
) => {
    const result = await prisma.purchaseOrder.update({
        where: {
            id: Number(purchaseOrderId),
        },
        data: {
            status: status,
        },
        include: {
            Document: true,
        },
    })

    await addDocumentRemark(
        result.Document.id,
        `เปลี่ยนสถานะเป็น ${purchaseOrderStatus[status]}`
    )

    revalidatePath('/purchase/purchase-order')
    revalidatePath(`/purchase/purchase-order/${result.Document.documentNo}`)
}
