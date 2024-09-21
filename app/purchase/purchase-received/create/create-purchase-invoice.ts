'use server'

import prisma from '@/app/db/db'
import { format } from 'date-fns'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { DocumentItem } from '@/types/document-item'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { DocumentDetail } from '@/types/document-detail'

export const createPurchaseInvoice = async (
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
    purchaseOrderIds: number[] = []
) => {
    const contact = await prisma.contact.findUnique({
        where: {
            id: Number(contactId),
        },
    })
    if (!contact) {
        throw new Error('contact not found')
    }

    const goodsMasters = await prisma.goodsMaster.findMany({
        where: {
            barcode: {
                in: items
                    .filter((item) => item.barcode != null)
                    .map((item) => item.barcode) as string[],
            },
        },
    })
    if (goodsMasters.length !== items.length) {
        throw new Error('goods not found')
    }

    if (!documentNo) {
        documentNo = await generateDocumentNumber('PINV', date)
    }

    const session = await getServerSession(authOptions)

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
                    amount: -(
                        item.quantity *
                        item.pricePerUnit *
                        (item.vatable ? 100 / 107 : 1)
                    ).toFixed(2),
                }
            })
    )

    const invoice = await prisma.document.create({
        data: {
            contactName: contactName || '',
            address: address || '',
            phone: phone || '',
            taxId: taxId || '',
            date: new Date(date),
            documentNo: documentNo,
            referenceNo: referenceNo,
            type: 'Purchase',
            createdBy: session?.user.username,
            updatedBy: session?.user.username,
            Purchase: {
                create: {
                    contactId: contactId,
                    GeneralLedger: {
                        create: [
                            // เจ้าหนี้การค้า
                            {
                                chartOfAccountId: 21000,
                                amount: -items
                                    .reduce(
                                        (a, b) =>
                                            a + b.pricePerUnit * b.quantity,
                                        0
                                    )
                                    .toFixed(2),
                            },
                            // ซื้อ
                            {
                                chartOfAccountId: 13000,
                                amount: +items
                                    .filter((item) => item.goodsMasterId)
                                    .reduce(
                                        (a, b) =>
                                            a +
                                            b.pricePerUnit *
                                                b.quantity *
                                                (b.vatable ? 100 / 107 : 1),
                                        0
                                    )
                                    .toFixed(2),
                            },
                            ...serviceAndNonStockItemsGLCreate,
                            // ภาษีซื้อ
                            {
                                chartOfAccountId: 15100,
                                amount: -items
                                    .filter((item) => item.vatable)
                                    .reduce(
                                        (a, b) =>
                                            a +
                                            b.pricePerUnit *
                                                b.quantity *
                                                (7 / 107),
                                        0
                                    )
                                    .toFixed(2),
                            },
                        ],
                    },
                    PurchaseItem: {
                        create: items.map((item) => ({
                            costPerUnit: item.pricePerUnit,
                            quantityPerUnit: item.quantityPerUnit,
                            quantity: item.quantity,
                            unit: item.unit,
                            vatable: item.vatable === true,
                            vat: item.vatable
                                ? +(item.pricePerUnit * (7 / 107)).toFixed(2)
                                : 0,
                            barcode: item.barcode,
                            description: item.detail,
                            name: item.name,
                            skuMasterId: item.skuMasterId,
                            goodsMasterId: item.goodsMasterId,
                            serviceAndNonStockItemId:
                                item.serviceAndNonStockItemId,
                        })),
                    },
                    PurchaseOrder: {
                        connect: purchaseOrderIds.map((id) => ({
                            documentId: id,
                        })),
                    },
                },
            },
        },
    })

    await prisma.contact.update({
        where: {
            id: Number(contactId),
        },
        data: {
            SkuMaster: {
                connect: items.map((item) => ({ id: item.skuMasterId })),
            },
        },
    })

    revalidatePath('/purchase/purchase-received')
    redirect(`/purchase/purchase-received/${invoice.documentNo}`)
}
