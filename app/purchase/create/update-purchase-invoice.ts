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
    items: DocumentItem[],
    purchaseOrderId?: number
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
                `${item.name} \nมียอดคงเหลือต่ำกว่า 0 ไม่สามารถลบได้`
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

    const updatedResult = await prisma.document.update({
        where: {
            id,
        },
        data: {
            contactName: address?.split('\n')[0] || undefined,
            address: address?.substring(address.indexOf('\n') + 1) || undefined,
            phone: phone || undefined,
            taxId: taxId || undefined,
            date: date ? new Date(date) : undefined,
            documentNo: documentNo || undefined,
            referenceNo: referenceNo || undefined,
            updatedBy: session?.user.username,
            remark: remark ? { create: { remark } } : undefined,
            ApSubledger: !!contact
                ? {
                      update: {
                          contactId: Number(contactId),
                      },
                  }
                : undefined,
            GeneralLedger: {
                update: [
                    // เจ้าหนี้การค้า
                    {
                        where: {
                            id: invoice?.GeneralLedger.find(
                                ({ chartOfAccountId }) =>
                                    chartOfAccountId === 21000
                            )?.id,
                        },
                        data: {
                            chartOfAccountId: 21000,
                            amount: -items.reduce(
                                (sum, item) =>
                                    sum + item.quantity * item.pricePerUnit,
                                0
                            ),
                        },
                    },
                    // สินค้าคงเหลือ
                    {
                        where: {
                            id: invoice?.GeneralLedger.find(
                                ({ chartOfAccountId }) =>
                                    chartOfAccountId === 13000
                            )?.id,
                        },
                        data: {
                            chartOfAccountId: 13000,
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
                    },
                    // ภาษีซื้อ
                    {
                        where: {
                            id: invoice?.GeneralLedger.find(
                                ({ chartOfAccountId }) =>
                                    chartOfAccountId === 15100
                            )?.id,
                        },
                        data: {
                            chartOfAccountId: 15100,
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
                    },
                ],
            },
            SkuIn: {
                update: items
                    .filter((item) =>
                        invoice?.SkuIn.find(
                            (skuIn) =>
                                skuIn.goodsMasterId === item.goodsMasterId
                        )
                    )
                    .map((item) => {
                        return {
                            where: {
                                id: invoice?.SkuIn.find(
                                    (skuIn) =>
                                        skuIn.goodsMasterId ===
                                        item.goodsMasterId
                                )?.id,
                            },
                            data: {
                                date: new Date(date),
                                goodsMasterId: item.goodsMasterId,
                                skuMasterId: item.skuMasterId,
                                barcode: item.barcode,
                                unit: item.unit,
                                quantityPerUnit: item.quantityPerUnit,
                                quantity: item.quantity * item.quantityPerUnit,
                                cost: +(
                                    ((100 / 107) * +item.pricePerUnit) /
                                    item.quantityPerUnit
                                ).toFixed(2),
                                vat: +(
                                    ((7 / 107) * +item.pricePerUnit) /
                                    item.quantityPerUnit
                                ).toFixed(2),
                            },
                        }
                    }),
                delete: invoice?.SkuIn.filter(
                    (skuIn) =>
                        !items
                            .map((item) => item.goodsMasterId)
                            .includes(skuIn.goodsMasterId)
                ).map((skuIn) => ({
                    id: skuIn.id,
                })),
                create: items
                    .filter(
                        (item) =>
                            !invoice?.SkuIn.map(
                                (skuIn) => skuIn.goodsMasterId
                            ).includes(item.goodsMasterId)
                    )
                    .map((item) => {
                        return {
                            date: new Date(date),
                            goodsMasterId: item.goodsMasterId,
                            skuMasterId: item.skuMasterId,
                            barcode: item.barcode,
                            unit: item.unit,
                            quantityPerUnit: item.quantityPerUnit,
                            quantity: item.quantity * item.quantityPerUnit,
                            cost: +(
                                ((100 / 107) * +item.pricePerUnit) /
                                item.quantityPerUnit
                            ).toFixed(2),
                            vat: +(
                                ((7 / 107) * +item.pricePerUnit) /
                                item.quantityPerUnit
                            ).toFixed(2),
                        }
                    }),
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

    revalidatePath('/purchase')
    revalidatePath(`/purchase/${documentNo}`)
    redirect(`/purchase/${documentNo}`)
}
