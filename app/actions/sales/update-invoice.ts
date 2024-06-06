'use server'

import prisma from '@/app/db/db'
import { Contact, Prisma } from '@prisma/client'
import { format } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

export const updateInvoice = async (id: number, formData: FormData) => {
    const validator = z.object({
        customerId: z.string().trim().optional().nullable(),
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
                // prefix: '- ',
                // prefixSeparator: ' ',
                // includePath: false,
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
                    SkuInToOut: true,
                },
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
        and ("SkuInToOut".id not in (${Prisma.join(invoice.SkuOut.flatMap((item) => item.SkuInToOut.map((item) => item.id)))})
        or "SkuInToOut".id is null)
        group by "SkuIn".id 
        having sum("SkuInToOut".quantity) < "SkuIn".quantity or sum("SkuInToOut".quantity) is null
        order by "SkuIn"."date", "SkuIn"."id" asc`

    for (let i = 0; i < barcodes.length; i++) {
        const goodsMaster = goodsMasters.find(
            (goods) => goods.barcode === barcodes[i]
        )
        if (!goodsMaster) {
            throw new Error('goods not found')
        }

        const remaining = checkRemaining.filter(
            (item) => item.skuMasterId === goodsMaster.skuMasterId
        )

        if (
            remaining.length <= 0 ||
            remaining.reduce((sum, item) => sum + item.remaining, 0) <
                mapQuanties[i].q * mapQuanties[i].quantity
        ) {
            throw new Error('insufficient inventory')
        }
    }
    console.log(mapQuanties)
    const deleteSkuInToOut = prisma.skuInToOut.deleteMany({
        where: {
            id: {
                in: invoice.SkuOut.flatMap((item) =>
                    item.SkuInToOut.map((item) => item.id)
                ),
            },
        },
    })
    const updateInvoice = prisma.document.update({
        where: { id },
        data: {
            contactName: address?.split('\n')[0] || undefined,
            address: address?.substring(address.indexOf('\n') + 1) || undefined,
            phone: phone || undefined,
            taxId: taxId || undefined,
            date: date ? new Date(date) : undefined,
            documentId: documentId || undefined,
            remark: remark ? { create: { remark } } : undefined,
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
            SkuOut: {
                deleteMany: {
                    id: {
                        in: invoice.SkuOut.flatMap((item) => item.id),
                    },
                },
                create: mapQuanties.map((item) => {
                    return {
                        date: date ? new Date(date) : undefined,
                        goodsMasterId: item.id,
                        skuMasterId: item.skuMasterId,
                        barcode: String(item.barcode),
                        unit: item.unit,
                        quantityPerUnit: item.quantity,
                        quantity: item.q * item.quantity,
                        cost: 0,
                        price: +((100 / 107) * item.q * item.price).toFixed(2),
                        vat: +((7 / 107) * item.q * item.price).toFixed(2),
                        SkuInToOut: {
                            create: checkRemaining
                                .filter(
                                    ({ skuMasterId }) =>
                                        item.skuMasterId === skuMasterId
                                )
                                ?.map(({ id, remaining }, index, array) => {
                                    if (index === 0) {
                                        if (remaining > item.q * item.quantity)
                                            return {
                                                skuInId: id,
                                                quantity:
                                                    item.q * item.quantity,
                                            }
                                        if (remaining < item.q * item.quantity)
                                            return {
                                                skuInId: id,
                                                quantity: remaining,
                                            }
                                    }
                                    // ครั้งที่ 2+ ตัดยอดหมดแล้ว
                                    if (
                                        item.q * item.quantity <
                                        array
                                            .slice(0, index)
                                            .reduce(
                                                (sum, item) =>
                                                    sum + item.remaining,
                                                0
                                            )
                                    )
                                        return undefined

                                    // ครั้งที่ 2+ ตัดทั้ง lot

                                    if (
                                        item.q * item.quantity -
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
                                        item.q * item.quantity -
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
                                                item.q * item.quantity -
                                                array
                                                    .slice(0, index)
                                                    .reduce(
                                                        (sum, item) =>
                                                            sum +
                                                            item.remaining,
                                                        0
                                                    ),
                                        }
                                })
                                .filter((item) => item),
                        },
                    }
                }),
            },
        },
    })

    await prisma.$transaction([deleteSkuInToOut, updateInvoice])

    revalidatePath('/sales')
    revalidatePath(`/sales/${documentId}`)
}
