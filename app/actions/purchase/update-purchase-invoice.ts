'use server'

import prisma from '@/app/db/db'
import { format } from 'date-fns'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export const updatePurchaseInvoice = async (id: number, formData: FormData) => {
    const validator = z.object({
        vendorId: z.string().trim().min(1, 'vendorId must not be empty'),
        address: z.string().trim().optional().nullable(),
        phone: z.string().trim().optional().nullable(),
        taxId: z.string().trim().optional().nullable(),
        barcodes: z
            .array(z.string().trim().min(1, 'barcode must not be empty'))
            .min(1),
        quanties: z.array(z.coerce.number().positive().min(0).or(z.string())),
        prices: z.array(z.coerce.number().or(z.string())),
        date: z.string().trim().min(1, 'date must not be empty'),
        documentNo: z.string().trim().optional().nullable(),
    })

    const result = validator.safeParse({
        vendorId: formData.get('vendorId') || undefined,
        address: formData.get('address') || undefined,
        phone: formData.get('phone') || undefined,
        taxId: formData.get('taxId') || undefined,
        barcodes: formData.getAll('barcode') || undefined,
        quanties: formData.getAll('quantity') || undefined,
        prices: formData.getAll('price') || undefined,
        date: formData.get('date') || undefined,
        documentNo: formData.get('documentNo') || undefined,
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

    let {
        vendorId,
        address,
        phone,
        taxId,
        barcodes,
        quanties,
        prices,
        date,
        documentNo,
    } = result.data

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
                in: barcodes,
            },
        },
    })
    if (goodsMasters.length !== barcodes.length) {
        throw new Error('goods not found')
    }

    let mapQuanties: (Awaited<
        ReturnType<typeof prisma.goodsMaster.findFirstOrThrow>
    > & { q: number; p: number })[] = goodsMasters.map((goodsMaster) => {
        return {
            ...goodsMaster,
            q: +quanties[barcodes.indexOf(goodsMaster.barcode)],
            p: +prices[barcodes.indexOf(goodsMaster.barcode)],
        }
    })

    if (!documentNo) {
        documentNo = await generateDocumentNumber('PINV', date)
    }

    const session = await getServerSession(authOptions)

    const invoice = await prisma.document.findUnique({
        where: {
            id,
        },
        include: {
            SkuIn: true,
            SkuOut: true,
        },
    })

    const error = { message: '' }

    for (let item of invoice?.SkuIn || []) {
        const currentQuantity = mapQuanties.reduce(
            (sum, mapQuantity) =>
                item.skuMasterId !== mapQuantity.skuMasterId
                    ? sum
                    : sum + mapQuantity.q * mapQuantity.quantityPerUnit,
            0
        )

        // if (currentQuantity)

        // if (item.SkuInToOut.length > 0) {
        //     const mapQuantity = mapQuanties.find(
        //         (mapQuantity) => mapQuantity.skuMasterId === item.skuMasterId
        //     )
        //     if (!mapQuantity) {
        //         error.message += `${item.barcode} ได้ถูกขายแล้ว ไม่สามารถลบได้\n`
        //         continue
        //     }
        //     if (
        //         mapQuantity.q * mapQuantity.quantity <
        //         item.SkuInToOut.reduce((sum, item) => sum + item.quantity, 0)
        //     ) {
        //         error.message += `${item.barcode} ได้ถูกขายไปแล้ว ${item.SkuInToOut.reduce((sum, item) => sum + item.quantity, 0)} หน่วย ห้ามแก้ไขจำนวนต่ำกว่านี้\n`
        //         continue
        //     }
        // }
    }

    if (error.message) throw new Error(error.message)

    await prisma.document.update({
        where: {
            id,
        },
        data: {
            contactName: address?.split('\n')[0] || '',
            address: address?.substring(address.indexOf('\n') + 1) || '',
            phone: phone || '',
            taxId: taxId || '',
            date: new Date(date),
            documentNo: documentNo,
            createdBy: session?.user.username,
            updatedBy: session?.user.username,
            ApSubledger: {
                create: {
                    contactId: Number(vendorId),
                },
            },
            GeneralLedger: {
                create: [
                    // เจ้าหนี้การค้า
                    {
                        chartOfAccountId: 21000,
                        amount: -mapQuanties.reduce(
                            (sum, item) => sum + item.q * item.p,
                            0
                        ),
                    },
                    // สินค้าคงเหลือ
                    {
                        chartOfAccountId: 13000,
                        amount: +mapQuanties
                            .reduce(
                                (sum, item) =>
                                    sum + (item.q * item.p * 100) / 107,
                                0
                            )
                            .toFixed(2),
                    },
                    // ภาษีซื้อ
                    {
                        chartOfAccountId: 15100,
                        amount: +mapQuanties
                            .reduce(
                                (sum, item) =>
                                    sum + (item.q * item.p * 7) / 107,
                                0
                            )
                            .toFixed(2),
                    },
                ],
            },
            SkuIn: {
                create: mapQuanties.map((item) => ({
                    date: new Date(date),
                    goodsMasterId: item.id,
                    skuMasterId: item.skuMasterId,
                    barcode: item.barcode,
                    unit: item.unit,
                    quantityPerUnit: item.quantityPerUnit,
                    quantity: item.q * item.quantityPerUnit,
                    cost: +((100 / 107) * +item.p * item.q).toFixed(2),
                    vat: +((7 / 107) * +item.p * item.q).toFixed(2),
                })),
            },
        },
    })
}
