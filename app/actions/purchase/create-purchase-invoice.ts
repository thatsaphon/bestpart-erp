'use server'

import prisma from '@/app/db/db'
import { format } from 'date-fns'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { generateDocumentNumber } from '../sales/create-invoice'

export const createPurchaseInvoice = async (formData: FormData) => {
    const validator = z.object({
        vendorId: z.string().trim().min(1, 'vendorId must not be empty'),
        barcodes: z
            .array(z.string().trim().min(1, 'barcode must not be empty'))
            .min(1),
        quanties: z.array(
            z.coerce.number().positive().min(0.01).or(z.string())
        ),
        prices: z.array(z.coerce.number().or(z.string())),
        date: z.string().trim().min(1, 'date must not be empty'),
        documentId: z.string().trim().optional().nullable(),
    })

    const result = validator.safeParse({
        vendorId: formData.get('vendorId'),
        barcodes: formData.getAll('barcode'),
        quanties: formData.getAll('quantity'),
        prices: formData.getAll('price'),
        date: formData.get('date'),
        documentId: formData.get('documentId'),
    })

    if (!result.success) {
        console.log({
            vendorId: formData.get('vendorId'),
            barcodes: formData.getAll('barcode'),
            quanties: formData.getAll('quantity'),
            prices: formData.getAll('price'),
            date: formData.get('date'),
            documentId: formData.get('documentId'),
        })
        throw new Error(
            fromZodError(result.error, {
                prefix: '- ',
                prefixSeparator: ' ',
                issueSeparator: '\n',
            }).message
        )
    }

    let { vendorId, barcodes, quanties, prices, date, documentId } = result.data

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

    console.log(documentId)
    if (!documentId) {
        documentId = await generateDocumentNumber('PINV', date)
        console.log(documentId)
    }

    const invoice = await prisma.document.create({
        data: {
            date: new Date(date),
            documentId: documentId,

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
                    skuMasterId: item.skuMasterId,
                    barcode: item.barcode,
                    quantity: item.q * item.quantity,
                    cost: +(((100 / 107) * +item.p) / item.quantity).toFixed(2),
                    vat: +(((7 / 107) * +item.p) / item.quantity).toFixed(2),
                    remaining: item.q * item.quantity,
                })),
            },
        },
    })
}
