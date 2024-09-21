'use server'

import prisma from '@/app/db/db'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { DocumentItem } from '@/types/document-item'
import { DocumentDetail } from '@/types/document-detail'
import { checkRemaining } from '@/actions/check-remaining'
import { addDays } from 'date-fns'

export const updatePurchaseOrder = async (
    id: number,
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
    customerOrderIds: number[] = []
) => {
    const contact = await prisma.contact.findUnique({
        where: {
            id: contactId || undefined,
        },
    })
    if (!contact) {
        throw new Error('contact not found')
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
    if (goodsMasters.length !== items.length) {
        throw new Error('goods not found')
    }

    const session = await getServerSession(authOptions)

    const invoice = await prisma.document.findUnique({
        where: {
            id,
        },
        include: {
            PurchaseOrder: {
                include: {
                    PurchaseOrderItem: true,
                },
            },
        },
    })

    // if (error.message) throw new Error(error.message)
    // const serviceAndNonStockItemsGLCreate = await Promise.all(
    //     items
    //         .filter((item) => item.serviceAndNonStockItemId)
    //         .map(async (item) => {
    //             const serviceAndNonStockItem =
    //                 await prisma.serviceAndNonStockItem.findUniqueOrThrow({
    //                     where: {
    //                         id: item.serviceAndNonStockItemId,
    //                     },
    //                 })
    //             return {
    //                 chartOfAccountId: serviceAndNonStockItem.chartOfAccountId,
    //                 amount: -(
    //                     item.quantity *
    //                     item.pricePerUnit *
    //                     (item.vatable ? 100 / 107 : 1)
    //                 ).toFixed(2),
    //             }
    //         })
    // )
    console.log(customerOrderIds?.map((id) => ({ id: id })))

    const updatedResult = await prisma.document.update({
        where: {
            id,
        },
        data: {
            contactName: contactName,
            address: address,
            phone: phone || undefined,
            taxId: taxId || undefined,
            date: date ? new Date(date) : undefined,
            documentNo: documentNo || undefined,
            referenceNo: referenceNo || undefined,
            updatedBy: session?.user.username,
            PurchaseOrder: {
                update: {
                    contactId: contact.id,
                    PurchaseOrderItem: {
                        deleteMany: {
                            id: {
                                in: invoice?.PurchaseOrder?.PurchaseOrderItem.map(
                                    (item) => item.id
                                ),
                            },
                        },
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
                        set:
                            customerOrderIds?.map((id) => ({
                                documentId: id,
                            })) || [],
                    },
                },
            },
        },
    })

    revalidatePath('/purchase/purchase-order')
    revalidatePath(`/purchase/purchase-order/${documentNo}`)
    redirect(`/purchase/purchase-order/${documentNo}`)
}
