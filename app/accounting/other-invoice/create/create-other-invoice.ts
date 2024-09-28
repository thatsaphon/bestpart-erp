'use server'

import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import {
    calculateApPaymentStatus,
    calculateArPaymentStatus,
} from '@/lib/calculate-payment-status'
import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { AccountType, AssetType } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import deleteOtherInvoice from '../[documentNo]/delete-other-invoice'
import { DocumentItem } from '@/types/document-item'
import { DocumentDetail } from '@/types/document-detail'

export type OtherInvoiceItems = {}

export const createOtherInvoice = async (
    {
        contactId,
        contactName,
        address,
        phone,
        taxId,
        date,
        documentNo,
        referenceNo,
    }: DocumentDetail,
    items: DocumentItem[],
    payments: {
        id: number
        amount: number
    }[],
    remarks: { id?: number; remark: string }[]
) => {
    if (!documentNo) documentNo = await generateDocumentNumber('INV', date)

    const serviceAndNonStockItemsGLCreate = await Promise.all(
        items
            .filter((item) => item.serviceAndNonStockItemId)
            .map(async (item) => {
                const serviceAndNonStockItem =
                    await prisma.serviceAndNonStockItem.findUniqueOrThrow({
                        where: {
                            id: item.serviceAndNonStockItemId,
                        },
                    })
                return {
                    chartOfAccountId: serviceAndNonStockItem.chartOfAccountId,
                    amount: +(
                        item.quantity *
                        item.pricePerUnit *
                        (item.vatable ? 100 / 107 : 1)
                    ).toFixed(2),
                }
            })
    )

    const createdBy = await getServerSession(authOptions)

    const document = await prisma.document.create({
        data: {
            date: new Date(date),
            documentNo: documentNo,
            type: 'OtherInvoice',
            createdBy:
                createdBy?.user.first_name + ' ' + createdBy?.user.last_name,
            // contactId,
            address: address || '',
            contactName: contactName || '',
            phone: phone || '',
            taxId: taxId || '',
            DocumentRemark: { create: remarks },
            referenceNo: referenceNo,
            OtherInvoice: {
                create: {
                    contactId: Number(contactId) || undefined,
                    OtherInvoiceItem: {
                        create: items.map((item) => ({
                            serviceAndNonStockItemId:
                                item.serviceAndNonStockItemId,
                            quantity: item.quantity,
                            unit: item.unit,
                            costPerUnit: item.pricePerUnit,
                            vat: item.vatable
                                ? +(item.pricePerUnit * (7 / 107)).toFixed(2)
                                : 0,
                            name: item.name,
                            description: item.detail,
                        })),
                    },
                    GeneralLedger: {
                        create: [
                            ...serviceAndNonStockItemsGLCreate,
                            ...payments.map((payment) => {
                                return {
                                    chartOfAccountId: payment.id,
                                    amount: -payment.amount,
                                }
                            }),
                        ],
                    },
                },
            },
        },
    })

    revalidatePath('/accounting/other-invoice')
    redirect('/accounting/other-invoice/')
}
