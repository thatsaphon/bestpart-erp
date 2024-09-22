'use server'

import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import { DocumentDetail } from '@/types/document-detail'
import { Payment } from '@/types/payment/payment'
import { PurchasePaymentItem } from '@/types/purchase-payment/purchase-payment-item'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const updatePurchasePayment = async (
    documentId: number,
    documentDetail: DocumentDetail,
    PurchasePaymentItems: PurchasePaymentItem[],
    payments: Payment[],
    remarks: { id?: number; remark: string; isDeleted?: boolean }[]
) => {
    if (!documentDetail.contactId) throw new Error('contact not found')
    if (!PurchasePaymentItems.length) throw new Error('items not found')

    const PurchasePayment = await prisma.document.findFirstOrThrow({
        where: { id: documentId },
        include: {
            PurchasePayment: true,
        },
    })

    const deleteGenaralLedger = prisma.generalLedger.deleteMany({
        where: { purchasePaymentId: PurchasePayment.PurchasePayment?.id },
    })

    const session = await getServerSession(authOptions)

    const updateDocument = prisma.document.update({
        where: { id: documentId },
        data: {
            type: 'PurchasePayment',
            documentNo: documentDetail.documentNo,
            date: documentDetail.date,
            contactName: documentDetail.contactName,
            address: documentDetail.address,
            phone: documentDetail.phone,
            taxId: documentDetail.taxId,
            updatedBy: session?.user?.id,
            DocumentRemark: {
                create: remarks
                    .map(({ id, remark }) => ({
                        id,
                        remark,
                        userId: session?.user.id,
                    }))
                    .filter(({ id }) => !id),
                update: remarks
                    .filter(({ id }) => id)
                    .map((remark) => ({
                        where: { id: remark.id },
                        data: {
                            remark: remark.remark,
                            isDeleted: remark.isDeleted,
                        },
                    })),
            },
            PurchasePayment: {
                update: {
                    contactId: documentDetail.contactId,
                    Purchase: {
                        set: PurchasePaymentItems.filter(
                            (item) => item.type === 'Purchase'
                        ).map((item) => ({ id: item.id })),
                    },
                    PurchaseReturn: {
                        set: PurchasePaymentItems.filter(
                            (item) => item.type === 'PurchaseReturn'
                        ).map((item) => ({ id: item.id })),
                    },
                    GeneralLedger: {
                        create: [
                            ...payments.map((payment) => ({
                                chartOfAccountId: payment.chartOfAccountId,
                                amount: payment.amount,
                            })),
                            {
                                chartOfAccountId: 21000,
                                amount: -PurchasePaymentItems.reduce(
                                    (acc, item) => acc + item.amount,
                                    0
                                ),
                            },
                        ],
                    },
                },
            },
        },
    })

    const result = await prisma.$transaction([
        deleteGenaralLedger,
        updateDocument,
    ])

    revalidatePath('/Purchase/Purchase-received')
    redirect(`/Purchase/Purchase-received/${result[1].documentNo}`)
}
