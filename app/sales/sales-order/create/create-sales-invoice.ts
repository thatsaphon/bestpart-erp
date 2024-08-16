'use server'

import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import { Contact, Prisma } from '@prisma/client'
import { format } from 'date-fns'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { InventoryDetailType } from '@/types/inventory-detail'
import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { redirect } from 'next/navigation'
import { calculateArPaymentStatus } from '@/lib/calculate-payment-status'

const create = async () => {
    // return prisma.document.create({
    // })
}
type DocumentSales = {
    contactId?: string
    contactName?: string
    address?: string
    phone?: string
    taxId?: string
    date: Date
    documentNo?: string
}

export const createSalesInvoice = async (
    // formData: FormData,
    {
        contactId,
        contactName,
        address,
        phone,
        taxId,
        date,
        documentNo,
    }: DocumentSales,
    items: Prisma.SalesItemUncheckedCreateWithoutSalesInput[],
    payments: {
        id: number
        amount: number
    }[],
    remarks: { id?: number; remark: string }[]
) => {
    // const validator = z.object({
    //     customerId: z.string().trim().nullable(),
    //     contactName: z.string().trim().optional(),
    //     address: z.string().trim().optional(),
    //     phone: z.string().trim().optional().nullable(),
    //     taxId: z.string().trim().optional().nullable(),
    //     date: z.string().trim().min(1, 'date must not be empty'),
    //     documentNo: z.string().trim().optional().nullable(),
    // })

    // const result = validator.safeParse({
    //     customerId: formData.get('customerId'),
    //     contactName: formData.get('contactName') || undefined,
    //     address: formData.get('address') || undefined,
    //     phone: formData.get('phone') || undefined,
    //     taxId: formData.get('taxId') || undefined,
    //     date: formData.get('date'),
    //     documentNo: formData.get('documentNo'),
    // })

    // if (!result.success) {
    //     throw new Error(
    //         fromZodError(result.error, {
    //             prefix: '- ',
    //             prefixSeparator: ' ',
    //             includePath: false,
    //             issueSeparator: '\n',
    //         }).message
    //     )
    // }

    // let { customerId, contactName, address, phone, taxId, date, documentNo } =
    //     result.data

    const getContact = async () => {
        if (contactId) {
            const contact = await prisma.contact.findUnique({
                where: {
                    id: Number(contactId),
                },
            })
            if (!contact) {
                throw new Error('contact not found')
            }
            return contact
        }
    }
    let contact: Contact | undefined = await getContact()

    if (
        payments.find((payment) => payment.id === 12000) &&
        (!contact || !contact.credit)
    ) {
        throw new Error(`${contact?.name || ''} ไม่สามารถขายเงินเชื่อได้`)
    }

    //check goodsMasterExist
    const goodsMasters = await prisma.goodsMaster.findMany({
        where: {
            id: {
                in: items
                    .filter((item) => typeof item.goodsMasterId === 'number')
                    .map((item) => item.goodsMasterId as number),
            },
        },
    })

    //check ServiceAndNonStockItem
    const serviceAndNonStockItems =
        await prisma.serviceAndNonStockItem.findMany({
            where: {
                id: {
                    in: items
                        .filter(
                            (item) =>
                                typeof item.serviceAndNonStockItemId ===
                                'number'
                        )
                        .map((item) => item.serviceAndNonStockItemId as number),
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

    if (!documentNo) {
        documentNo = await generateDocumentNumber('SO', date)
    }

    const session = await getServerSession(authOptions)

    const invoice = await prisma.document.create({
        data: {
            contactName: contactName || '',
            address: address || '',
            phone: phone || '',
            taxId: taxId || '',
            date: new Date(date),
            documentNo: documentNo,
            DocumentRemark: { create: remarks },
            createdBy: session?.user.first_name,
            updatedBy: session?.user.first_name,
            Sales: {
                create: {
                    contactId: !!contact ? Number(customerId) : undefined,
                    GeneralLedger: {
                        create: [
                            // 11000 = เงินสด, 12000 = ลูกหนี้
                            ...payments.map((payment) => {
                                return {
                                    chartOfAccountId: payment.id,
                                    amount: payment.amount,
                                }
                            }),
                            // ขาย
                            {
                                chartOfAccountId: 41000,
                                amount: -items
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
                            // ภาษีขาย
                            {
                                chartOfAccountId: 23100,
                                amount: -items
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
                        ],
                    },
                    SalesItem: {
                        // create: [],
                        create: {} as Prisma.SalesItemUncheckedCreateWithoutSalesInput[],
                    },
                },
            },
            ArSubledger: !!contact
                ? {
                      create: {
                          contactId: Number(customerId),
                          paymentStatus: calculateArPaymentStatus(payments),
                      },
                  }
                : undefined,
            GeneralLedger: {
                create: [
                    // 11000 = เงินสด, 12000 = ลูกหนี้
                    ...payments.map((payment) => {
                        return {
                            chartOfAccountId: payment.id,
                            amount: payment.amount,
                        }
                    }),
                    // ขาย
                    {
                        chartOfAccountId: 41000,
                        amount: -items
                            .reduce(
                                (sum, item) =>
                                    sum +
                                    (item.quantity * item.pricePerUnit * 100) /
                                        107,
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
                                    (item.quantity * item.pricePerUnit * 7) /
                                        107,
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
                        quantity: item.quantity,
                        cost: 0,
                        price: +((100 / 107) * item.pricePerUnit).toFixed(2),
                        vat: +((7 / 107) * item.pricePerUnit).toFixed(2),
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

    revalidatePath('/sales/sales-order')
    redirect(`/sales/sales-order/${invoice.documentNo}`)
}
