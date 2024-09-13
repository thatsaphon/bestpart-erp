'use server'

import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import { DocumentDetail } from '@/types/document-detail'
import { Payment } from '@/types/payment/payment'
import { SalesBillItem } from '@/types/sales-bill/sales-bill-item'
import { SalesReceivedItem } from '@/types/sales-received/sales-receive-item'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const updateSalesReceived = async (
    documentId: number,
    documentDetail: DocumentDetail,
    salesReceivedItems: SalesReceivedItem[],
    payments: Payment[],
    remarks: { id?: number; remark: string; isDeleted?: boolean }[]
) => {
    if (!documentDetail.contactId) throw new Error('contact not found')
    if (!salesReceivedItems.length) throw new Error('items not found')

    const salesReceived = await prisma.document.findFirstOrThrow({
        where: { id: documentId },
        include: {
            SalesReceived: true,
        },
    })

    const deleteGenaralLedger = prisma.generalLedger.deleteMany({
        where: { salesReceivedId: salesReceived.SalesReceived?.id },
    })

    const session = await getServerSession(authOptions)

    const updateDocument = prisma.document.update({
        where: { id: documentId },
        data: {
            type: 'SalesReceived',
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
            SalesReceived: {
                update: {
                    contactId: documentDetail.contactId,
                    Sales: {
                        set: salesReceivedItems
                            .filter((item) => item.type === 'Sales')
                            .map((item) => ({ id: item.id })),
                    },
                    SalesReturn: {
                        set: salesReceivedItems
                            .filter((item) => item.type === 'SalesReturn')
                            .map((item) => ({ id: item.id })),
                    },
                    SalesBill: {
                        set: salesReceivedItems
                            .filter((item) => item.type === 'SalesBill')
                            .map((item) => ({ id: item.id })),
                    },
                    GeneralLedger: {
                        create: [
                            ...payments.map((payment) => ({
                                chartOfAccountId: payment.chartOfAccountId,
                                amount: payment.amount,
                            })),
                            {
                                chartOfAccountId: 12000,
                                amount: -salesReceivedItems.reduce(
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

    revalidatePath('/sales/sales-received')
    redirect(`/sales/sales-received/${result[1].documentNo}`)
}
