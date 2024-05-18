'use server'

import prisma from '@/app/db/db'
import { Contact } from '@prisma/client'
import { format } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

export const updateInvoice = async (id: number, formData: FormData) => {
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
        customerId: formData.get('customerId') || undefined,
        address: formData.get('address') || undefined,
        phone: formData.get('phone') || undefined,
        taxId: formData.get('taxId') || undefined,
        barcodes: formData.getAll('barcode') || undefined,
        quanties: formData.getAll('quantity') || undefined,
        date: formData.get('date') || undefined,
        documentId: formData.get('documentId') || undefined,
        payment: formData.get('payment') || undefined,
        remark: formData.get('remark') || undefined,
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

    const invoice = await prisma.document.findUniqueOrThrow({
        where: { id },
        include: {
            GeneralLedger: true,
            ArSubledger: true,
            SkuOut: {
                include: {
                    GoodsMaster: true,
                },
            },
        },
    })

    for (let skuOut of invoice.SkuOut) {
        const skuIn = await prisma.skuIn.findMany({})
    }

    for (let i = 0;i < barcodes.length;i++) {
        const goodsMaster = goodsMasters.find(
            (goods) => goods.barcode === barcodes[i]
        )
        if (!goodsMaster) {
            throw new Error('goods not found')
        }
        // if (
        //     !(await isSufficient(mapQuanties[i].skuMasterId, mapQuanties[i].q))
        // ) {
        //     throw new Error('insufficient inventory')
        // }
    }

    await prisma.document.update({
        where: { id },
        data: {
            contactName: address?.split('\n')[0] || undefined,
            address: address?.substring(address.indexOf('\n') + 1) || undefined,
            phone: phone || undefined,
            taxId: taxId || undefined,
            date: date ? new Date(date) : undefined,
            documentId: documentId || undefined,
            remark: remark || undefined,
            ArSubledger: !!contact
                ? {
                    update: {
                        contactId: Number(customerId),
                        paymentStatus:
                            payment === 'cash' ? 'Paid' : 'NotPaid',
                    },
                }
                : undefined,
            GeneralLedger: {
                update: [
                    // 11000 = เงินสด, 12000 = ลูกหนี้
                    {
                        where: {
                            id: invoice?.GeneralLedger.find(
                                ({ chartOfAccountId }) =>
                                    chartOfAccountId === 11000 ||
                                    chartOfAccountId === 12000
                            )?.id,
                        },
                        data: {
                            chartOfAccountId:
                                !!contact && payment === 'credit'
                                    ? 12000
                                    : 11000,
                            amount: +mapQuanties
                                .reduce(
                                    (sum, item) => sum + item.q * item.price,
                                    0
                                )
                                .toFixed(2),
                        },
                    },
                    // รายได้
                    {
                        where: {
                            id: invoice?.GeneralLedger.find(
                                ({ chartOfAccountId }) =>
                                    chartOfAccountId === 41000
                            )?.id,
                        },
                        data: {
                            chartOfAccountId: 41000,
                            amount: -mapQuanties
                                .reduce(
                                    (sum, item) =>
                                        sum + (item.q * item.price * 100) / 107,
                                    0
                                )
                                .toFixed(2),
                        },
                    },
                    // ภาษีขาย
                    {
                        where: {
                            id: invoice?.GeneralLedger.find(
                                ({ chartOfAccountId }) =>
                                    chartOfAccountId === 23100
                            )?.id,
                        },
                        data: {
                            chartOfAccountId: 23100,
                            amount: -mapQuanties
                                .reduce(
                                    (sum, item) =>
                                        sum + (item.q * item.price * 7) / 107,
                                    0
                                )
                                .toFixed(2),
                        },
                    },
                ],
            },
        },
    })


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
