'use server'

import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import { Contact, Prisma } from '@prisma/client'
import { format } from 'date-fns'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { InvoiceItemDetailType } from './invoice-item-detail-type'

export const createSalesInvoice = async (
    formData: FormData,
    items: InvoiceItemDetailType[]
) => {
    const validator = z.object({
        customerId: z.string().trim().nullable(),
        address: z.string().trim().optional().nullable(),
        phone: z.string().trim().optional().nullable(),
        taxId: z.string().trim().optional().nullable(),
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
                in: items.map((item) => item.barcode),
            },
        },
    })

    const checkRemaining: {
        id: number
        skuMasterId: number
        barcode: string
        quantity: number
        remaining: number
    }[] = await prisma.$queryRaw`
        select "SkuIn".id, "SkuIn"."skuMasterId", "SkuIn".barcode, "SkuIn".quantity, "SkuIn".quantity - COALESCE(sum("SkuInToOut".quantity), 0)  as remaining 
        from "SkuIn" left join "SkuInToOut" on "SkuIn"."id" = "SkuInToOut"."skuInId" 
        where "SkuIn"."skuMasterId" in (${Prisma.join(goodsMasters.map((item) => item.skuMasterId))})
        group by "SkuIn".id 
        having sum("SkuInToOut".quantity) < "SkuIn".quantity or sum("SkuInToOut".quantity) is null
        order by "SkuIn"."date", "SkuIn"."id" asc`

    if (goodsMasters.length !== items.length) {
        throw new Error('goods not found')
    }

    for (let i = 0; i < items.length; i++) {
        const goodsMaster = goodsMasters.find(
            (goods) => goods.barcode === items[i].barcode
        )
        if (!goodsMaster) {
            throw new Error(`barcode ${items[i].barcode} not found`)
        }

        const remaining = checkRemaining.filter(
            (item) => item.skuMasterId === goodsMaster.skuMasterId
        )

        if (
            remaining.length <= 0 ||
            remaining.reduce((sum, item) => sum + item.remaining, 0) <
                items[i].quantity * items[i].quantityPerUnit
        ) {
            throw new Error('insufficient inventory')
        }
    }

    if (!documentId) {
        documentId = await generateDocumentNumber('SINV', date)
    }

    const session = await getServerSession(authOptions)

    const invoice = await prisma.document.create({
        data: {
            contactName: address?.split('\n')[0] || '',
            address: address?.substring(address.indexOf('\n') + 1) || '',
            phone: phone || '',
            taxId: taxId || '',
            date: new Date(date),
            documentId: documentId,
            remark: remark ? { create: { remark } } : undefined,
            createdBy: session?.user.first_name,
            updatedBy: session?.user.first_name,
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
                        amount: +items
                            .reduce(
                                (sum, item) => sum + item.quantity * item.price,
                                0
                            )
                            .toFixed(2),
                    },
                    // รายได้
                    {
                        chartOfAccountId: 41000,
                        amount: -items
                            .reduce(
                                (sum, item) =>
                                    sum +
                                    (item.quantity * item.price * 100) / 107,
                                0
                            )
                            .toFixed(2),
                    },
                    // ภาษีขาย
                    {
                        chartOfAccountId: 23100,
                        amount: -items
                            .reduce(
                                (sum, item) =>
                                    sum +
                                    (item.quantity * item.price * 7) / 107,
                                0
                            )
                            .toFixed(2),
                    },
                ],
            },
            SkuOut: {
                create: items.map((item) => {
                    return {
                        date: new Date(date),
                        goodsMasterId: item.goodsMasterId,
                        skuMasterId: item.skuMasterId,
                        barcode: String(item.barcode),
                        unit: item.unit,
                        quantityPerUnit: item.quantityPerUnit,
                        quantity: item.quantity * item.quantityPerUnit,
                        cost: 0,
                        price: +((100 / 107) * item.price).toFixed(2),
                        vat: +((7 / 107) * item.price).toFixed(2),
                        SkuInToOut: {
                            create: checkRemaining
                                .filter(
                                    ({ skuMasterId }) =>
                                        item.skuMasterId === skuMasterId
                                )
                                ?.map(({ id, remaining }, index, array) => {
                                    if (index === 0) {
                                        if (
                                            remaining >
                                            item.quantity * item.quantityPerUnit
                                        )
                                            return {
                                                skuInId: id,
                                                quantity:
                                                    item.quantity *
                                                    item.quantityPerUnit,
                                            }
                                        if (
                                            remaining <
                                            item.quantity * item.quantityPerUnit
                                        )
                                            return {
                                                skuInId: id,
                                                quantity: remaining,
                                            }
                                    }
                                    // ครั้งที่ 2+ ตัดยอดหมดแล้ว
                                    if (
                                        item.quantity * item.quantityPerUnit <
                                        array
                                            .slice(0, index)
                                            .reduce(
                                                (sum, item) =>
                                                    sum + item.remaining,
                                                0
                                            )
                                    )
                                        return { skuInId: 0, quantity: 0 } // 0 will be filter out

                                    // ครั้งที่ 2+ ตัดทั้ง lot

                                    if (
                                        item.quantity * item.quantityPerUnit -
                                            array
                                                .slice(0, index)
                                                .reduce(
                                                    (sum, item) =>
                                                        sum + item.remaining,
                                                    0
                                                ) >=
                                        remaining
                                    )
                                        return {
                                            skuInId: id,
                                            quantity: remaining,
                                        }

                                    // ครั้งที่ 2+ ตัดส่วนที่เหลือ
                                    if (
                                        item.quantity * item.quantityPerUnit -
                                            array
                                                .slice(0, index)
                                                .reduce(
                                                    (sum, item) =>
                                                        sum + item.remaining,
                                                    0
                                                ) <
                                        remaining
                                    )
                                        return {
                                            skuInId: id,
                                            quantity:
                                                item.quantity *
                                                    item.quantityPerUnit -
                                                array
                                                    .slice(0, index)
                                                    .reduce(
                                                        (sum, item) =>
                                                            sum +
                                                            item.remaining,
                                                        0
                                                    ),
                                        }

                                    return {
                                        skuInId: 0, // 0 will be filter out
                                        quantity: 0,
                                    }
                                })
                                .filter((item) => !!item.skuInId),
                        },
                    }
                }),
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
