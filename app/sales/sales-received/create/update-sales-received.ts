'use server'

import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import prisma from '@/app/db/db'
import { DocumentDetail } from '@/types/document-detail'
import { Payment } from '@/types/payment/payment'
import { SalesBillItem } from '@/types/sales-bill/sales-bill-item'
import { SalesReceivedItem } from '@/types/sales-received/sales-receive-item'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const updateSalesReceived = async (
    documentId: number,
    documentDetail: DocumentDetail,
    salesBillItems: SalesReceivedItem[],
    payments: Payment[]
) => {
    if (!documentDetail.contactId) throw new Error('contact not found')
    if (!salesBillItems.length) throw new Error('items not found')

    const result = await prisma.document.update({
        where: { id: documentId },
        data: {
            type: 'SalesBill',
            documentNo: documentDetail.documentNo,
            date: documentDetail.date,
            contactName: documentDetail.contactName,
            address: documentDetail.address,
            phone: documentDetail.phone,
            taxId: documentDetail.taxId,
            SalesBill: {
                update: {
                    contactId: documentDetail.contactId,
                    Sales: {
                        set: salesBillItems
                            .filter((item) => item.type === 'Sales')
                            .map((item) => ({ id: item.id })),
                    },
                    SalesReturn: {
                        set: salesBillItems
                            .filter((item) => item.type === 'SalesReturn')
                            .map((item) => ({ id: item.id })),
                    },
                },
            },
        },
    })

    revalidatePath('/sales/sales-received')
    redirect(`/sales/sales-received/${result.documentNo}`)
}
