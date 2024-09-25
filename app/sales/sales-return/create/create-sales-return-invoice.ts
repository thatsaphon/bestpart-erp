'use server'

import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import { Contact, Prisma } from '@prisma/client'
import { format } from 'date-fns'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { redirect } from 'next/navigation'
import { calculateArPaymentStatus } from '@/lib/calculate-payment-status'
import { DocumentDetail } from '@/types/document-detail'
import { checkRemaining } from '@/actions/check-remaining'
import { DocumentItem } from '@/types/document-item'
import { Payment } from '@/types/payment/payment'

export const createSalesReturnInvoice = async (
    {
        contactId,
        contactName,
        address,
        phone,
        taxId,
        date,
        referenceNo,
        documentNo,
    }: DocumentDetail,
    items: DocumentItem[],
    payments: Payment[],
    remarks: { id?: number; remark: string }[]
) => {
    const getContact = async () => {
        if (contactId) {
            const contact = await prisma.contact.findUnique({
                where: {
                    id: Number(contactId),
                },
            })
            if (!contact) {
                throw new Error('contact not found')
            }
            return contact
        }
    }
    let contact: Contact | undefined = await getContact()

    if (
        payments.find((payment) => payment.chartOfAccountId === 12000) &&
        (!contact || !contact.credit)
    ) {
        throw new Error(`${contact?.name || ''} ไม่สามารถขายเงินเชื่อได้`)
    }

    //check goodsMasterExist
    const goodsMasters = await prisma.goodsMaster.findMany({
        where: {
            id: {
                in: items
                    .filter((item) => typeof item.goodsMasterId === 'number')
                    .map((item) => item.goodsMasterId as number),
            },
        },
    })

    if (
        goodsMasters.length !==
        items.filter((item) => typeof item.goodsMasterId === 'number').length
    ) {
        throw new Error('goods not found')
    }

    //check ServiceAndNonStockItem
    const serviceAndNonStockItems =
        await prisma.serviceAndNonStockItem.findMany({
            where: {
                id: {
                    in: items
                        .filter((item) => item.serviceAndNonStockItemId != null)
                        .map((item) => item.serviceAndNonStockItemId as number),
                },
            },
        })

    if (!documentNo) {
        documentNo = await generateDocumentNumber('CN', date.toISOString())
    }

    const session = await getServerSession(authOptions)

    const invoice = await prisma.document.create({
        data: {
            type: 'SalesReturn',
            referenceNo: referenceNo || '',
            contactName: contactName || '',
            address: address || '',
            phone: phone || '',
            taxId: taxId || '',
            date: new Date(date),
            documentNo: documentNo,
            DocumentRemark: {
                create: remarks.map(({ remark }) => ({
                    remark: remark,
                    userId: session?.user.id,
                })),
            },
            createdBy: session?.user.first_name,
            updatedBy: session?.user.first_name,
            SalesReturn: {
                create: {
                    contactId: !!contact ? Number(contactId) : undefined,
                    GeneralLedger: {
                        create: [
                            // 11000 = เงินสด, 12000 = ลูกหนี้
                            ...payments.map((payment) => {
                                return {
                                    chartOfAccountId: payment.chartOfAccountId,
                                    amount: -payment.amount,
                                }
                            }),
                            // ขาย
                            {
                                chartOfAccountId: 41200,
                                amount: +items
                                    .filter((item) => item.goodsMasterId)
                                    .reduce(
                                        (sum, item) =>
                                            sum +
                                            item.quantity *
                                                item.pricePerUnit *
                                                (100 / 107),
                                        0
                                    )
                                    .toFixed(2),
                            },
                            ...items
                                .filter((item) => item.serviceAndNonStockItemId)
                                .map((item) => {
                                    const nonStockItem =
                                        serviceAndNonStockItems.find(
                                            (x) =>
                                                x.id ===
                                                item.serviceAndNonStockItemId
                                        )
                                    return {
                                        chartOfAccountId:
                                            nonStockItem?.chartOfAccountId as number,
                                        amount: +(
                                            (item.pricePerUnit *
                                                item.quantity *
                                                100) /
                                            107
                                        ).toFixed(2),
                                    }
                                }),
                            // ภาษีขาย
                            {
                                chartOfAccountId: 23100,
                                amount: +items
                                    .reduce(
                                        (sum, item) =>
                                            sum +
                                            item.quantity *
                                                item.pricePerUnit *
                                                (7 / 107),
                                        0
                                    )
                                    .toFixed(2),
                            },
                        ],
                    },
                    SalesReturnItem: {
                        create: items.map((item) => ({
                            pricePerUnit: item.pricePerUnit,
                            quantity: item.quantity,
                            unit: item.unit,
                            vat: +(item.pricePerUnit * (7 / 107)).toFixed(2),
                            barcode: item.barcode,
                            description: item.detail,
                            name: item.name,
                            goodsMasterId: item.goodsMasterId,
                            quantityPerUnit: item.quantityPerUnit,
                            serviceAndNonStockItemId:
                                item.serviceAndNonStockItemId,
                            skuMasterId: item.skuMasterId,
                        })),
                    },
                },
            },
        },
    })

    await prisma.skuRemainingCache.updateMany({
        where: {
            skuMasterId: {
                in: items
                    .filter((item) => typeof item.skuMasterId === 'number')
                    .map((item) => item.skuMasterId) as number[],
            },
        },
        data: {
            shouldRecheck: true,
        },
    })

    revalidatePath('/sales/sales-return')
    redirect(`/sales/sales-return/${invoice.documentNo}`)
}
