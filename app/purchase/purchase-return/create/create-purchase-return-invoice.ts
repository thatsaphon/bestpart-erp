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

export const createPurchaseReturnInvoice = async (
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
    items: (DocumentItem & {
        costPerUnitExVat: number
        costPerUnitIncVat: number
    })[],
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

    if (goodsMasters.length !== items.length) {
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
        })
    )

    for (const item of itemsRemainings) {
        if (item.quantity > item.remainings) {
            throw new Error(
                `${item.name} \nต้องการขาย ${item.quantity} ชิ้น \nแต่ยอดคงเหลือ ${item.remainings} ชิ้น`
            )
        }
    }

    if (!documentNo) {
        documentNo = await generateDocumentNumber('PR', date.toISOString())
    }

    const session = await getServerSession(authOptions)

    const invoice = await prisma.document.create({
        data: {
            type: 'PurchaseReturn',
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
            PurchaseReturn: {
                create: {
                    contactId: !!contact ? Number(contactId) : undefined,
                    GeneralLedger: {
                        create: [
                            // เจ้าหนี้การค้า
                            {
                                chartOfAccountId: 21000,
                                amount: +items
                                    .reduce(
                                        (a, b) =>
                                            a +
                                            b.costPerUnitIncVat * b.quantity,
                                        0
                                    )
                                    .toFixed(2),
                            },
                            // คืนสินค้า
                            {
                                chartOfAccountId: 51100,
                                amount: -items
                                    .reduce(
                                        (sum, item) =>
                                            sum +
                                            item.quantity *
                                                item.costPerUnitExVat,
                                        0
                                    )
                                    .toFixed(2),
                            },
                            // ภาษีซื้อ
                            {
                                chartOfAccountId: 15100,
                                amount: -items
                                    .reduce(
                                        (sum, item) =>
                                            sum +
                                            (item.costPerUnitIncVat -
                                                item.costPerUnitExVat),
                                        0
                                    )
                                    .toFixed(2),
                            },
                        ],
                    },
                    PurchaseReturnItem: {
                        create: items.map((item) => ({
                            costPerUnitIncVat: item.costPerUnitIncVat,
                            costPerUnitExVat: item.costPerUnitExVat,
                            quantity: item.quantity,
                            unit: item.unit,
                            vat: item.costPerUnitIncVat - item.costPerUnitExVat,
                            barcode: item.barcode,
                            description: item.detail,
                            name: item.name,
                            goodsMasterId: item.goodsMasterId,
                            quantityPerUnit: item.quantityPerUnit,
                            serviceAndNonStockItemId:
                                item.serviceAndNonStockItemId,
                            skuMasterId: item.skuMasterId,
                            vatable: item.vatable,
                            isIncludeVat: item.isIncludeVat,
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

    revalidatePath('/purchase/purchase-return')
    redirect(`/purchase/purchase-return/${invoice.documentNo}`)
}
