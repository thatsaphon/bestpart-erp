'use server'

import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import { DocumentDetail } from '@/types/document-detail'
import { Payment } from '@/types/payment/payment'
import { PurchasePaymentItem } from '@/types/purchase-payment/purchase-payment-item'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const createPurchasePayment = async (
    documentDetail: DocumentDetail,
    purchasePaymentItems: PurchasePaymentItem[],
    payments: Payment[],
    remarks: { id?: number; remark: string; isDeleted?: boolean }[]
) => {
    if (!documentDetail.contactId) throw new Error('contact not found')
    if (!purchasePaymentItems.length) throw new Error('items not found')

    if (
        payments.reduce((a, b) => a + b.amount, 0) !==
        purchasePaymentItems.reduce((a, b) => a + b.amount, 0)
    ) {
        throw new Error('จำนวนเงินที่ชำระเงินไม่ถูกต้อง')
    }

    const documentNo =
        documentDetail.documentNo ||
        (await generateDocumentNumber('PV', documentDetail.date))

    const session = await getServerSession(authOptions)

    const result = await prisma.document.create({
        data: {
            type: 'PurchasePayment',
            documentNo: documentNo,
            date: documentDetail.date,
            contactName: documentDetail.contactName,
            address: documentDetail.address,
            phone: documentDetail.phone,
            taxId: documentDetail.taxId,
            createdBy: session?.user?.id,
            updatedBy: session?.user?.id,
            DocumentRemark: {
                create: remarks.map((remark) => ({
                    remark: remark.remark,
                    userId: session?.user?.id,
                })),
            },
            PurchasePayment: {
                create: {
                    contactId: documentDetail.contactId,
                    Purchase: {
                        connect: purchasePaymentItems
                            .filter((item) => item.type === 'Purchase')
                            .map((item) => ({ id: item.id })),
                    },
                    PurchaseReturn: {
                        connect: purchasePaymentItems
                            .filter((item) => item.type === 'PurchaseReturn')
                            .map((item) => ({ id: item.id })),
                    },
                    GeneralLedger: {
                        create: [
                            ...payments.map((payment) => ({
                                chartOfAccountId: payment.chartOfAccountId,
                                amount: -payment.amount,
                            })),
                            {
                                chartOfAccountId: 21000,
                                amount: purchasePaymentItems.reduce(
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

    revalidatePath('/purchase/purchase-payment')
    redirect(`/purchase/purchase-payment/${result.documentNo}`)
}
