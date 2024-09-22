'use server'

import prisma from '@/app/db/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const deletePurchasePayment = async (documentNo: string) => {
    const purchasePayment = await prisma.document.findFirstOrThrow({
        where: {
            documentNo,
        },
        include: {
            PurchasePayment: true,
        },
    })

    const deleteGeneralLedger = prisma.generalLedger.deleteMany({
        where: {
            purchasePaymentId: purchasePayment.PurchasePayment?.id,
        },
    })
    const deletePurchasePayment = prisma.purchasePayment.delete({
        where: {
            id: purchasePayment.PurchasePayment?.id,
        },
    })
    const deleteDocument = prisma.document.delete({
        where: {
            documentNo,
        },
    })

    await prisma.$transaction([
        deleteGeneralLedger,
        deletePurchasePayment,
        deleteDocument,
    ])
    revalidatePath('/purchase/purchase-received')
    redirect('/purchase/purchase-received')
}
