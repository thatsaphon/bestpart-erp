'use server'

import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import prisma from '@/app/db/db'
import { DocumentDetail } from '@/types/document-detail'
import { Payment } from '@/types/payment/payment'
import { SalesReceivedItem } from '@/types/sales-received/sales-receive-item'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const createSalesReceived = async (
    documentDetail: DocumentDetail,
    salesReceivedItems: SalesReceivedItem[],
    payments: Payment[]
) => {
    if (!documentDetail.contactId) throw new Error('contact not found')
    if (!salesReceivedItems.length) throw new Error('items not found')

    if (
        payments.reduce((a, b) => a + b.amount, 0) !==
        salesReceivedItems.reduce((a, b) => a + b.amount, 0)
    ) {
        throw new Error('จำนวนเงินที่ชำระเงินไม่ถูกต้อง')
    }

    const documentNo =
        documentDetail.documentNo ||
        (await generateDocumentNumber('RV', documentDetail.date))
    console.log(salesReceivedItems)

    const result = await prisma.document.create({
        data: {
            type: 'SalesReceived',
            documentNo: documentNo,
            date: documentDetail.date,
            contactName: documentDetail.contactName,
            address: documentDetail.address,
            phone: documentDetail.phone,
            taxId: documentDetail.taxId,
            SalesReceived: {
                create: {
                    contactId: documentDetail.contactId,
                    Sales: {
                        connect: salesReceivedItems
                            .filter((item) => item.type === 'Sales')
                            .map((item) => ({ id: item.id })),
                    },
                    SalesReturn: {
                        connect: salesReceivedItems
                            .filter((item) => item.type === 'SalesReturn')
                            .map((item) => ({ id: item.id })),
                    },
                    SalesBill: {
                        connect: salesReceivedItems
                            .filter((item) => item.type === 'SalesBill')
                            .map((item) => ({ id: item.id })),
                    },
                    GeneralLedger: {
                        create: [
                            ...payments,
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

    revalidatePath('/sales/sales-received')
    redirect(`/sales/sales-received/${result.documentNo}`)
}
