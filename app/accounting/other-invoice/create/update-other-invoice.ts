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
import { Payment } from '@/types/payment/payment'
import { GetDocumentRemark } from '@/types/remark/document-remark'
import { roundAndRemoveZeroGenralLedgers } from '@/lib/round-genral-ledger'

export type OtherInvoiceItems = {}

export const updateOtherInvoice = async (
    documentId: number,
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
    items: (DocumentItem & {
        costPerUnitIncVat: number
        costPerUnitExVat: number
    })[],
    payments: Payment[],
    remarks: GetDocumentRemark[]
) => {
    if (!documentNo) documentNo = await generateDocumentNumber('INV', date)

    if (
        items.reduce((a, b) => a + b.costPerUnitIncVat * b.quantity, 0) !==
        payments.reduce((a, b) => a + b.amount, 0)
    ) {
        throw new Error('จำนวนเงินที่ชำระเงินไม่ตรงกัน')
    }

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
                    amount: +(item.quantity * item.costPerUnitExVat).toFixed(2),
                }
            })
    )

    const document = await prisma.document.findUniqueOrThrow({
        where: {
            id: documentId,
        },
        include: {
            OtherInvoice: {
                include: { GeneralLedger: true, OtherInvoiceItem: true },
            },
        },
    })

    const session = await getServerSession(authOptions)

    await prisma.document.update({
        where: {
            id: documentId,
        },
        data: {
            date: new Date(date),
            documentNo: documentNo,
            type: 'OtherInvoice',
            createdBy: session?.user.first_name + ' ' + session?.user.last_name,
            // contactId,
            address: address || '',
            contactName: contactName || '',
            phone: phone || '',
            taxId: taxId || '',
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
            referenceNo: referenceNo,
            OtherInvoice: {
                update: {
                    contactId: Number(contactId) || undefined,
                    OtherInvoiceItem: {
                        delete: document.OtherInvoice?.OtherInvoiceItem,
                        create: items.map((item) => ({
                            serviceAndNonStockItemId:
                                item.serviceAndNonStockItemId,
                            quantity: item.quantity,
                            unit: item.unit,
                            costPerUnitIncVat: item.costPerUnitIncVat,
                            costPerUnitExVat: item.costPerUnitExVat,
                            vat: item.costPerUnitIncVat - item.costPerUnitExVat,
                            name: item.name,
                            description: item.detail,
                            vatable: item.vatable,
                            isIncludeVat: item.isIncludeVat,
                        })),
                    },
                    GeneralLedger: {
                        delete: document.OtherInvoice?.GeneralLedger,
                        create: roundAndRemoveZeroGenralLedgers([
                            ...serviceAndNonStockItemsGLCreate,
                            {
                                chartOfAccountId: 15100,
                                amount: +items
                                    .reduce(
                                        (acc, item) =>
                                            !!item.vatable
                                                ? acc + 0
                                                : item.isIncludeVat
                                                  ? acc +
                                                    +(
                                                        (item.costPerUnitIncVat *
                                                            7) /
                                                        107
                                                    ).toFixed(2)
                                                  : acc +
                                                    +(
                                                        item.costPerUnitExVat *
                                                        0.07
                                                    ).toFixed(2),
                                        0
                                    )
                                    .toFixed(2),
                            },
                            ...payments.map((payment) => {
                                return {
                                    chartOfAccountId: payment.chartOfAccountId,
                                    amount: -payment.amount,
                                }
                            }),
                        ]),
                    },
                },
            },
        },
    })

    revalidatePath('/accounting/other-invoice')
    redirect('/accounting/other-invoice/')
}
