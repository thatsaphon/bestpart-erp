'use server'

import prisma from '@/app/db/db'
import { Contact, DocumentRemark, Prisma } from '@prisma/client'
import { format } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { DocumentItem } from '@/types/document-item'
import { redirect } from 'next/navigation'
import { calculateArPaymentStatus } from '@/lib/calculate-payment-status'
import { DocumentDetail } from '@/types/document-detail'
import { checkRemaining } from '@/actions/check-remaining'
import { Payment } from '@/types/payment/payment'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export const updateSalesReturnInvoice = async (
    id: number,
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
    remarks: { id?: number; remark: string; isDeleted?: boolean }[]
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

    const goodsMasters = await prisma.goodsMaster.findMany({
        where: {
            barcode: {
                in: items
                    .filter((item) => item.barcode)
                    .map((item) => item.barcode as string),
            },
        },
    })
    if (goodsMasters.length !== items.filter((item) => item.barcode).length) {
        throw new Error('goods not found')
    }

    const invoice = await prisma.document.findUniqueOrThrow({
        where: { id },
        include: {
            SalesReturn: {
                include: {
                    SalesReturnItem: true,
                    GeneralLedger: true,
                },
            },
        },
    })

    if (
        invoice.SalesReturn?.salesBillId ||
        invoice.SalesReturn?.salesReceivedId
    ) {
        throw new Error('ลูกค้าจ่ายบิลหรือวางบิลแล้วไม่สามารถแก้ไขได้')
    }

    const remainings = await checkRemaining(
        goodsMasters.map((item) => item.skuMasterId)
    )

    const groupBySkuMasterId = items.reduce(
        (acc: Record<number, DocumentItem[]>, item) => {
            if (!item.skuMasterId) return acc
            if (!acc[item.skuMasterId]) {
                acc[item.skuMasterId] = []
            }
            acc[item.skuMasterId].push(item)
            return acc
        },
        {}
    )

    const itemsRemainings = Object.entries(groupBySkuMasterId).map(
        ([key, value]) => ({
            skuMasterId: Number(key),
            quantity: value?.reduce(
                (sum, item) => sum + item.quantity * item.quantityPerUnit,
                0
            ),
            name: value?.[0].name,
            remainings:
                remainings.find((r) => r.skuMasterId === Number(key))
                    ?.remaining || 0,
            oldQuantity:
                invoice.SalesReturn?.SalesReturnItem.filter(
                    (item) => item.skuMasterId === Number(key)
                ).reduce((sum, item) => sum + item.quantity, 0) || 0,
        })
    )

    for (const item of itemsRemainings) {
        if (item.quantity > item.remainings + item.oldQuantity) {
            throw new Error(
                `${item.name} \nต้องการขาย ${item.quantity} ชิ้น \nแต่ยอดคงเหลือ ${item.remainings + item.oldQuantity} ชิ้น`
            )
        }
    }
    const session = await getServerSession(authOptions)

    const updateInvoice = await prisma.document.update({
        where: { id },
        data: {
            contactName: contactName || undefined,
            address: address || undefined,
            phone: phone || undefined,
            taxId: taxId || undefined,
            date: date ? new Date(date) : undefined,
            documentNo: documentNo || undefined,
            updatedBy: session?.user.first_name,
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
            SalesReturn: {
                update: {
                    contactId: contactId || undefined,
                    GeneralLedger: {
                        delete: invoice?.SalesReturn?.GeneralLedger,
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
                                chartOfAccountId: 41000,
                                amount: +items
                                    .reduce(
                                        (sum, item) =>
                                            sum +
                                            (item.quantity *
                                                item.pricePerUnit *
                                                100) /
                                                107,
                                        0
                                    )
                                    .toFixed(2),
                            },
                            // ภาษีขาย
                            {
                                chartOfAccountId: 23100,
                                amount: +items
                                    .reduce(
                                        (sum, item) =>
                                            sum +
                                            (item.quantity *
                                                item.pricePerUnit *
                                                7) /
                                                107,
                                        0
                                    )
                                    .toFixed(2),
                            },
                        ],
                    },
                    SalesReturnItem: {
                        delete: invoice?.SalesReturn?.SalesReturnItem,
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
                in: [
                    ...(items
                        .filter((item) => item.skuMasterId != null)
                        .map((item) => item.skuMasterId) as number[]),
                    ...(invoice.SalesReturn?.SalesReturnItem.filter(
                        (item) => item.skuMasterId != null
                    ).map((item) => item.skuMasterId as number) || []),
                ],
            },
        },
        data: {
            shouldRecheck: true,
        },
    })

    revalidatePath('/sales/sales-return')
    revalidatePath(`/sales/sales-return/${documentNo}`)
    redirect(`/sales/sales-return/${documentNo}`)
}
