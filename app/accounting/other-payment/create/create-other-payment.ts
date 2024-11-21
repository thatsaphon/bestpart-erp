'use server'

import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import { DocumentDetail } from '@/types/document-detail'
import { OtherPaymentItem } from '@/types/other-payment/other-payment-item'
import { Payment } from '@/types/payment/payment'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const createOtherPayment = async (
    documentDetail: DocumentDetail,
    otherPaymentItems: OtherPaymentItem[],
    payments: Payment[],
    remarks: { id?: number; remark: string; isDeleted?: boolean }[]
) => {
    if (!documentDetail.contactId) throw new Error('contact not found')
    if (!otherPaymentItems.length) throw new Error('items not found')

    if (
        payments.reduce((a, b) => a + b.amount, 0) !==
        otherPaymentItems.reduce((a, b) => a + b.amount, 0)
    ) {
        throw new Error('จำนวนเงินที่ชำระเงินไม่ถูกต้อง')
    }

    const documentNo =
        documentDetail.documentNo ||
        (await generateDocumentNumber('OP', documentDetail.date))

    const session = await getServerSession(authOptions)

    const result = await prisma.document.create({
        data: {
            type: 'OtherPayment',
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
            OtherPayment: {
                create: {
                    contactId: documentDetail.contactId,
                    OtherInvoice: {
                        connect: otherPaymentItems
                            .filter((item) => item.type === 'OtherInvoice')
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
                                amount: otherPaymentItems.reduce(
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

    revalidatePath('/accounting/other-payment')
    redirect(`/accounting/other-payment/${result.documentNo}`)
}
