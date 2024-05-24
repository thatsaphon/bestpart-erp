'use server'

import prisma from '@/app/db/db'
import { format } from 'date-fns'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { generateDocumentNumber } from '@/app/actions/sales/create-invoice'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const updatePurchaseInvoice = async (
    id: number,
    formData: FormData,
    items: {
        barcode: string
        skuMasterId: number
        name: string
        detail: string
        unit: string
        quantityPerUnit: number
        quantity: number
        price: number
        partNumber: string
    }[]
) => {
    const validator = z.object({
        vendorId: z.string().trim().min(1, 'vendorId must not be empty'),
        address: z.string().trim().optional().nullable(),
        phone: z.string().trim().optional().nullable(),
        taxId: z.string().trim().optional().nullable(),
        date: z.string().trim().min(1, 'date must not be empty'),
        documentId: z.string().trim().optional().nullable(),
        remark: z.string().trim().optional().nullable(),
    })

    const result = validator.safeParse({
        vendorId: formData.get('vendorId') || undefined,
        address: formData.get('address') || undefined,
        phone: formData.get('phone') || undefined,
        taxId: formData.get('taxId') || undefined,
        date: formData.get('date') || undefined,
        documentId: formData.get('documentId') || undefined,
        remark: formData.get('remark') || undefined,
    })

    if (!result.success) {
        throw new Error(
            fromZodError(result.error, {
                prefix: '- ',
                prefixSeparator: ' ',
                issueSeparator: '\n',
            }).message
        )
    }

    let { vendorId, address, phone, taxId, date, documentId, remark } =
        result.data

    const contact = await prisma.contact.findUnique({
        where: {
            id: Number(vendorId),
        },
    })
    if (!contact) {
        throw new Error('contact not found')
    }

    const goodsMasters = await prisma.goodsMaster.findMany({
        where: {
            barcode: {
                in: items.map((item) => item.barcode),
            },
        },
    })
    if (goodsMasters.length !== items.length) {
        throw new Error('goods not found')
    }

    if (!documentId) {
        documentId = await generateDocumentNumber('PINV', date)
    }

    const session = await getServerSession(authOptions)

    const invoice = await prisma.document.findUnique({
        where: {
            id,
        },
        include: {
            GeneralLedger: true,
            ApSubledger: true,
            SkuIn: { include: { SkuInToOut: true } },
        },
    })

    const error = { message: '' }
    for (let skuIn of invoice?.SkuIn || []) {
        if (skuIn.SkuInToOut.length > 0) {
            const mapQuantity = items.find(
                (item) => item.skuMasterId === skuIn.skuMasterId
            )
            if (!mapQuantity) {
                error.message += `${skuIn.barcode} ได้ถูกขายแล้ว ไม่สามารถลบได้\n`
                continue
            }
            if (
                mapQuantity.quantity * mapQuantity.quantityPerUnit <
                skuIn.SkuInToOut.reduce((sum, item) => sum + item.quantity, 0)
            ) {
                error.message += `${skuIn.barcode} ได้ถูกขายไปแล้ว ${skuIn.SkuInToOut.reduce((sum, item) => sum + item.quantity, 0)} หน่วย ห้ามแก้ไขจำนวนต่ำกว่านี้\n`
                continue
            }
        }
    }

    if (error.message) throw new Error(error.message)

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
            documentId: documentId || undefined,
            updatedBy: session?.user.username,
            remark: remark || undefined,
            ApSubledger: !!contact
                ? {
                      update: {
                          contactId: Number(vendorId),
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
                                (sum, item) => sum + item.quantity * item.price,
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
                                        (item.quantity * item.price * 100) /
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
                                        (item.quantity * item.price * 7) / 107,
                                    0
                                )
                                .toFixed(2),
                        },
                    },
                ],
            },
            SkuIn: {
                update: items.map((item) => {
                    const skuIn = invoice?.SkuIn.find(
                        (skuIn) => skuIn.skuMasterId === item.skuMasterId
                    )

                    return {
                        where: {
                            id: invoice?.SkuIn.find(
                                (skuIn) =>
                                    skuIn.skuMasterId === item.skuMasterId
                            )?.id,
                        },
                        data: {
                            date: new Date(date),
                            goodsMasterId: goodsMasters.find(
                                (master) => master.barcode === item.barcode
                            )?.id,
                            skuMasterId: item.skuMasterId,
                            barcode: item.barcode,
                            unit: item.unit,
                            quantityPerUnit: item.quantityPerUnit,
                            quantity: item.quantity * item.quantityPerUnit,
                            cost: +(
                                ((100 / 107) * +item.price) /
                                item.quantityPerUnit
                            ).toFixed(2),
                            vat: +(
                                ((7 / 107) * +item.price) /
                                item.quantityPerUnit
                            ).toFixed(2),
                        },
                    }
                }),
                delete: invoice?.SkuIn.filter(
                    (skuIn) =>
                        !items
                            .map((item) => item.skuMasterId)
                            .includes(skuIn.skuMasterId)
                ).map((skuIn) => ({
                    id: skuIn.id,
                })),
            },
        },
    })

    revalidatePath('/purchase')
    revalidatePath(`/purchase/${documentId}`)
    redirect(`/purchase/${documentId}`)
}
