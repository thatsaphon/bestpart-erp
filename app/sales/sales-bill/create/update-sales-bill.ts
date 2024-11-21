'use server'

import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import { DocumentDetail } from '@/types/document-detail'
import { SalesBillItem } from '@/types/sales-bill/sales-bill-item'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const updateSalesBill = async (
    documentId: number,
    documentDetail: DocumentDetail,
    salesBillItems: SalesBillItem[],
    remarks: { id?: number; remark: string; isDeleted: boolean }[]
) => {
    if (!documentDetail.contactId) throw new Error('contact not found')
    if (!salesBillItems.length) throw new Error('items not found')

    const documentNo = await generateDocumentNumber('SB', documentDetail.date)
    const session = await getServerSession(authOptions)

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

    revalidatePath('/sales/sales-bill')
    redirect(`/sales/sales-bill/${result.documentNo}`)
}
