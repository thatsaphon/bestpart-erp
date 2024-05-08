'use server'

import prisma from '@/app/db/db'
import { Contact } from '@prisma/client'
import { format } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

export const createInvoice = async (formData: FormData) => {
    const validator = z.object({
        customerId: z.string().trim().nullable(),
        address: z.string().trim().optional().nullable(),
        phone: z.string().trim().optional().nullable(),
        taxId: z.string().trim().optional().nullable(),
        barcodes: z
            .array(z.string().trim().min(1, 'barcode must not be empty'))
            .min(1),
        quanties: z.array(
            z.coerce.number().positive().min(0.01).or(z.string())
        ),
        date: z.string().trim().min(1, 'date must not be empty'),
        documentId: z.string().trim().optional().nullable(),
        payment: z.enum(['cash', 'transfer', 'credit']).default('cash'),
        remark: z.string().trim().optional().nullable(),
    })

    const result = validator.safeParse({
        customerId: formData.get('customerId'),
        address: formData.get('address'),
        phone: formData.get('phone'),
        taxId: formData.get('taxId'),
        barcodes: formData.getAll('barcode'),
        quanties: formData.getAll('quantity'),
        date: formData.get('date'),
        documentId: formData.get('documentId'),
        payment: formData.get('payment'),
        remark: formData.get('remark'),
    })

    if (!result.success) {
        throw new Error(
            fromZodError(result.error, {
                prefix: '- ',
                prefixSeparator: ' ',
                includePath: false,
                issueSeparator: '\n',
            }).message
        )
    }

    let {
        customerId,
        address,
        phone,
        taxId,
        barcodes,
        quanties,
        date,
        documentId,
        payment,
        remark,
    } = result.data

    const getContact = async () => {
        if (customerId) {
            const contact = await prisma.contact.findUnique({
                where: {
                    id: Number(customerId),
                },
            })
            if (!contact) {
                throw new Error('contact not found')
            }
            return contact
        }
    }
    let contact: Contact | undefined = await getContact()

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
    > & { q: number })[] = goodsMasters.map((goodsMaster) => {
        return {
            ...goodsMaster,
            q: +quanties[barcodes.indexOf(goodsMaster.barcode)],
        }
    })
    for (let i = 0; i < barcodes.length; i++) {
        const goodsMaster = goodsMasters.find(
            (goods) => goods.barcode === barcodes[i]
        )
        if (!goodsMaster) {
            throw new Error('goods not found')
        }
        if (
            !(await isSufficient(mapQuanties[i].skuMasterId, mapQuanties[i].q))
        ) {
            throw new Error('insufficient inventory')
        }
    }

    if (!documentId) {
        documentId = await generateDocumentNumber('SINV', date)
    }

    const invoice = await prisma.document.create({
        data: {
            contactName: address?.split('\n')[0] || '',
            address: address?.substring(address.indexOf('\n') + 1) || '',
            phone: phone || '',
            taxId: taxId || '',
            date: new Date(date),
            documentId: documentId,
            remark: remark || '',
            ArSubledger: !!contact
                ? {
                      create: {
                          contactId: Number(customerId),
                          paymentStatus:
                              payment === 'cash' ? 'Paid' : 'NotPaid',
                      },
                  }
                : undefined,
            GeneralLedger: {
                create: [
                    // 11000 = เงินสด, 12000 = ลูกหนี้
                    {
                        chartOfAccountId:
                            !!contact && payment === 'credit' ? 12000 : 11000,
                        amount: +mapQuanties
                            .reduce((sum, item) => sum + item.q * item.price, 0)
                            .toFixed(2),
                    },
                    // รายได้
                    {
                        chartOfAccountId: 41000,
                        amount: -mapQuanties
                            .reduce(
                                (sum, item) =>
                                    sum + (item.q * item.price * 100) / 107,
                                0
                            )
                            .toFixed(2),
                    },
                    // ภาษีขาย
                    {
                        chartOfAccountId: 23100,
                        amount: -mapQuanties
                            .reduce(
                                (sum, item) =>
                                    sum + (item.q * item.price * 7) / 107,
                                0
                            )
                            .toFixed(2),
                    },
                ],
            },
        },
    })

    const asyncSkuOut = mapQuanties.map(async (item) => ({
        date: new Date(date),
        goodsMasterId: item.id,
        skuMasterId: item.skuMasterId,
        barcode: String(item.barcode),
        unit: item.unit,
        quantityPerUnit: item.quantity,
        quantity: item.q * item.quantity,
        cost: await calInventoryCost(item.skuMasterId, +item.q, invoice.id),
        price: +((100 / 107) * item.q * item.price).toFixed(2),
        vat: +((7 / 107) * item.q * item.price).toFixed(2),
    }))

    const skuOut = await Promise.all(asyncSkuOut)

    await prisma.document.update({
        where: { id: invoice.id },
        data: {
            SkuOut: {
                create: skuOut.map((item) => ({
                    ...item,
                })),
            },
            GeneralLedger: {
                create: [
                    // สินค้า
                    {
                        chartOfAccountId: 13000,
                        amount: skuOut.reduce(
                            (sum, item) => sum + item.cost,
                            0
                        ),
                    },
                    // ต้นทุนขาย
                    {
                        chartOfAccountId: 51000,
                        amount: skuOut.reduce(
                            (sum, item) => sum + item.cost,
                            0
                        ),
                    },
                ],
            },
        },
    })
    revalidatePath('/sales')
}

const isSufficient = async (skuMasterId: number, quantity: number) => {
    const skuIn = await prisma.skuIn.findMany({
        where: { skuMasterId, remaining: { not: 0 } },
        orderBy: { date: 'asc' },
    })
    if (skuIn.reduce((sum, item) => sum + item.remaining, 0) < quantity) {
        return false
    }
    return true
}

const calInventoryCost = async (
    skuMasterId: number,
    quantity: number,
    documentId: number
) => {
    const skuIn = await prisma.skuIn.findMany({
        where: { skuMasterId, remaining: { not: 0 } },
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
    })
    if (skuIn.reduce((sum, item) => sum + item.remaining, 0) < quantity) {
        return 0
    }

    let result = 0
    let q = 0
    for (let i = 0; i < skuIn.length; i++) {
        if (q === quantity) {
            break
        }
        if (skuIn[i].remaining >= quantity - q) {
            result += skuIn[i].cost * (quantity - q)
            skuIn[i].remaining = skuIn[i].remaining - (quantity - q)
            q = quantity
            await prisma.skuIn.update({
                where: { id: skuIn[i].id },
                data: { remaining: skuIn[i].remaining },
            })
        }

        if (skuIn[i].remaining < quantity - q) {
            result += skuIn[i].cost * (quantity - q)
            q = q + skuIn[i].remaining
            skuIn[i].remaining = 0
            await prisma.skuIn.update({
                where: { id: skuIn[i].id },
                data: { remaining: skuIn[i].remaining },
            })
        }
    }

    return result
}

export const generateDocumentNumber = async (prefix: string, date: string) => {
    const todayFormat = `${prefix}${format(new Date(date), 'yyyyMMdd')}`
    const lastInvoice = await prisma.document.findFirst({
        where: { documentId: { contains: todayFormat } },
        orderBy: { documentId: 'desc' },
    })
    if (!lastInvoice || !lastInvoice?.documentId.includes(todayFormat)) {
        return `${todayFormat}001`
    }
    return (
        todayFormat +
        (+lastInvoice.documentId.slice(-3) + 1).toString().padStart(3, '0')
    )
}
