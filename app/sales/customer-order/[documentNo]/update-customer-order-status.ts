'use server'

import { addDocumentRemark } from '@/actions/add-document-remark'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import { customerOrderStatus } from '@/types/customer-order/customer-order-status'
import { CustomerOrderStatus } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

export const updateCustomerOrderStatus = async (
    customerOrderId: number,
    status: CustomerOrderStatus
) => {
    const result = await prisma.customerOrder.update({
        where: { id: customerOrderId },
        data: {
            status,
        },
        include: {
            Document: true,
        },
    })

    await addDocumentRemark(
        result.Document.id,
        `เปลี่ยนสถานะเป็น ${customerOrderStatus[status]}`
    )

    revalidatePath('/sales/customer-order')
    revalidatePath('/sales/customer-order/[documentNo]')
}
