'use server'

import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import { DocumentDetail } from '@/types/document-detail'
import { OtherPaymentItem } from '@/types/other-payment/other-payment-item'
import { Payment } from '@/types/payment/payment'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const updateOtherPayment = async (
    documentId: number,
    documentDetail: DocumentDetail,
    OtherPaymentItems: OtherPaymentItem[],
    payments: Payment[],
    remarks: { id?: number; remark: string; isDeleted?: boolean }[]
) => {
    if (!documentDetail.contactId) throw new Error('contact not found')
    if (!OtherPaymentItems.length) throw new Error('items not found')

    const OtherPayment = await prisma.document.findFirstOrThrow({
        where: { id: documentId },
        include: {
            OtherPayment: true,
        },
    })

    const deleteGenaralLedger = prisma.generalLedger.deleteMany({
        where: { otherPaymentId: OtherPayment.OtherPayment?.id },
    })

    const session = await getServerSession(authOptions)

    const updateDocument = prisma.document.update({
        where: { id: documentId },
        data: {
            type: 'OtherPayment',
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
            OtherPayment: {
                update: {
                    contactId: documentDetail.contactId,
                    OtherInvoice: {
                        set: OtherPaymentItems.filter(
                            (item) => item.type === 'OtherInvoice'
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
                                amount: -OtherPaymentItems.reduce(
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

    revalidatePath('/accounting/other-payment')
    redirect(`/accounting/other-payment/${result[1].documentNo}`)
}
