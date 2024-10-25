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

export const updatePurchaseInvoice = async (
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
    items: (DocumentItem & {
        costPerUnitIncVat: number
        costPerUnitExVat: number
        discountPerUnitExVat: number
        discountPerUnitIncVat: number
    })[],
    purchaseOrderIds: number[] = []
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

    if (goodsMasters.length + serviceAndNonStockItems.length !== items.length) {
        throw new Error('goods not found')
    }

    const session = await getServerSession(authOptions)

    const invoice = await prisma.document.findUnique({
        where: {
            id,
        },
        include: {
            Purchase: {
                include: {
                    GeneralLedger: true,
                    PurchaseItem: true,
                },
            },
        },
    })

    const remainings = await checkRemaining(
        invoice?.Purchase?.PurchaseItem.filter((item) => item.skuMasterId).map(
            (item) => item.skuMasterId as number
        ) || []
    )

    const groupBySkuMasterId = items
        .filter((item) =>
            remainings.find((r) => r.skuMasterId === item.skuMasterId)
        )
        .reduce((acc: Record<number, DocumentItem[]>, item) => {
            if (!item.skuMasterId) return acc
            if (!acc[item.skuMasterId]) {
                acc[item.skuMasterId] = []
            }
            acc[item.skuMasterId].push(item)
            return acc
        }, {})

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
            oldInvoice:
                invoice?.Purchase?.PurchaseItem.filter(
                    (item) => item.skuMasterId === Number(key)
                ).reduce(
                    (sum, item) => sum + item.quantity * item.quantityPerUnit,
                    0
                ) || 0,
        })
    )

    for (const item of itemsRemainings) {
        if (item.remainings - item.oldInvoice + item.quantity < 0) {
            throw new Error(
                `${item.name} \nมียอดคงเหลือต่ำกว่า 0 ไม่สามารถแก้ไขได้`
            )
        }
    }

    // const error = { message: '' }
    // for (let skuIn of invoice?.SkuIn || []) {
    //     if (skuIn.SkuInToOut.length > 0) {
    //         const mapQuantity = items.find(
    //             (item) => item.skuMasterId === skuIn.skuMasterId
    //         )
    //         if (!mapQuantity) {
    //             error.message += `${skuIn.barcode} ได้ถูกขายแล้ว ไม่สามารถลบได้\n`
    //             continue
    //         }
    //         if (
    //             mapQuantity.quantity * mapQuantity.quantityPerUnit <
    //             skuIn.SkuInToOut.reduce((sum, item) => sum + item.quantity, 0)
    //         ) {
    //             error.message += `${skuIn.barcode} ได้ถูกขายไปแล้ว ${skuIn.SkuInToOut.reduce((sum, item) => sum + item.quantity, 0)} หน่วย ห้ามแก้ไขจำนวนต่ำกว่านี้\n`
    //             continue
    //         }
    //     }
    // }

    // if (error.message) throw new Error(error.message)
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
                        (item.costPerUnitExVat - item.discountPerUnitExVat)
                    ).toFixed(2),
                }
            })
    )

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
            Purchase: {
                update: {
                    contactId: contactId,
                    GeneralLedger: {
                        delete:
                            invoice?.Purchase?.GeneralLedger.map(({ id }) => ({
                                id,
                            })) || [],
                        create: [
                            // เจ้าหนี้การค้า
                            {
                                chartOfAccountId: 21000,
                                amount: -items
                                    .reduce(
                                        (a, b) =>
                                            a +
                                            (b.costPerUnitIncVat -
                                                b.discountPerUnitIncVat) *
                                                b.quantity,
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
                                            (b.costPerUnitExVat -
                                                b.discountPerUnitExVat) *
                                                b.quantity,
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
                                            (b.costPerUnitIncVat -
                                                b.discountPerUnitIncVat -
                                                (b.costPerUnitExVat -
                                                    b.discountPerUnitExVat)) *
                                                (7 / 107),
                                        0
                                    )
                                    .toFixed(2),
                            },
                        ],
                    },
                    PurchaseItem: {
                        delete:
                            invoice?.Purchase?.PurchaseItem.map(({ id }) => ({
                                id,
                            })) || [],
                        create: items.map((item) => ({
                            costPerUnitExVat: item.costPerUnitExVat,
                            costPerUnitIncVat: item.costPerUnitIncVat,
                            discountPerUnitIncVat: item.discountPerUnitIncVat,
                            discountPerUnitExVat: item.discountPerUnitExVat,
                            discountString: item.discountString,
                            quantityPerUnit: item.quantityPerUnit,
                            quantity: item.quantity,
                            unit: item.unit,
                            vat:
                                item.costPerUnitIncVat -
                                item.discountPerUnitIncVat -
                                (item.costPerUnitExVat -
                                    item.discountPerUnitExVat),
                            barcode: item.barcode,
                            description: item.detail,
                            name: item.name,
                            skuMasterId: item.skuMasterId,
                            goodsMasterId: item.goodsMasterId,
                            serviceAndNonStockItemId:
                                item.serviceAndNonStockItemId,
                            vatable: item.vatable,
                            isIncludeVat: item.isIncludeVat,
                        })),
                    },
                    PurchaseOrder: {
                        set: purchaseOrderIds.map((id) => ({
                            documentId: id,
                        })),
                    },
                },
            },
        },
    })

    revalidatePath('/purchase/purchase-received')
    revalidatePath(`/purchase/purchase-received/${documentNo}`)
    redirect(`/purchase/purchase-received/${documentNo}`)
}
