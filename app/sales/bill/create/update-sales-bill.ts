'use server'

import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import prisma from '@/app/db/db'
import { DocumentDetail } from '@/types/document-detail'
import { SalesBillItem } from '@/types/sales-bill/sales-bill-item'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const updateSalesBill = async (
    documentId: number,
    documentDetail: DocumentDetail,
    salesBillItems: SalesBillItem[]
) => {
    if (!documentDetail.contactId) throw new Error('contact not found')
    if (!salesBillItems.length) throw new Error('items not found')

    const documentNo = await generateDocumentNumber('SB', documentDetail.date)
    console.log(salesBillItems)

    const result = await prisma.document.update({
        where: { id: documentId },
        data: {
            type: 'SalesBill',
            documentNo: documentNo,
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

    revalidatePath('/sales/bill')
    redirect(`/sales/bill/${result.documentNo}`)
}
