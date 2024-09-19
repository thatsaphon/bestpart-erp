'use server'

import prisma from '@/app/db/db'
import { addDays, format } from 'date-fns'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { DocumentItem } from '@/types/document-item'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { DocumentDetail } from '@/types/document-detail'

export const createPurchaseOrder = async (
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
    customerOrderIds?: number[]
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
        documentNo = await generateDocumentNumber('PO', date)
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
            type: 'PurchaseOrder',
            createdBy: session?.user.username,
            updatedBy: session?.user.username,
            PurchaseOrder: {
                create: {
                    status: 'Draft',
                    contactId: contact.id,
                    PurchaseOrderItem: {
                        create: items.map((item) => ({
                            costPerUnit: item.pricePerUnit,
                            quantityPerUnit: item.quantityPerUnit,
                            quantity: item.quantity,
                            unit: item.unit,
                            vat: item.vatable
                                ? +(item.pricePerUnit * (7 / 107)).toFixed(2)
                                : 0,
                            barcode: item.barcode,
                            description: item.name + ' ' + item.detail,
                            skuMasterId: item.skuMasterId,
                            goodsMasterId: item.goodsMasterId,
                            serviceAndNonStockItemId:
                                item.serviceAndNonStockItemId,
                            estimatedDeliveryDate: addDays(new Date(), 7),
                        })),
                    },
                    CustomerOrderLink: {
                        connect: customerOrderIds?.map((id) => ({ id })) || [],
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

    revalidatePath('/purchase/purchase-order')
    redirect(`/purchase/purchase-order/${invoice.documentNo}`)
}
