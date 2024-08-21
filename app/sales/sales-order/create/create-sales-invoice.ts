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
import { DocumentDetail } from '@/types/document-detail'
import { checkRemaining } from '@/actions/check-remaining'

const create = async () => {
    // return prisma.document.create({
    // })
}

export const createSalesInvoice = async (
    {
        contactId,
        contactName,
        address,
        phone,
        taxId,
        date,
        referenceNo,
        documentNo,
    }: DocumentDetail,
    items: InventoryDetailType[],
    payments: {
        id: number
        amount: number
    }[],
    remarks: { id?: number; remark: string }[]
) => {
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

    const remainings = await checkRemaining(
        goodsMasters.map((item) => item.skuMasterId)
    )
    console.log(remainings)
    // return
    // const checkRemaining: {
    //     id: number
    //     skuMasterId: number
    //     barcode: string
    //     quantity: number
    //     remaining: number
    // }[] = await prisma.$queryRaw`
    //     select "SkuIn".id, "SkuIn"."skuMasterId", "SkuIn".barcode, "SkuIn".quantity, "SkuIn".quantity - COALESCE(sum("SkuInToOut".quantity), 0)  as remaining
    //     from "SkuIn" left join "SkuInToOut" on "SkuIn"."id" = "SkuInToOut"."skuInId"
    //     where "SkuIn"."skuMasterId" in (${Prisma.join(goodsMasters.map((item) => item.skuMasterId))})
    //     group by "SkuIn".id
    //     having sum("SkuInToOut".quantity) < "SkuIn".quantity or sum("SkuInToOut".quantity) is null
    //     order by "SkuIn"."date", "SkuIn"."id" asc`

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
        documentNo = await generateDocumentNumber('SO', date.toISOString())
    }

    const session = await getServerSession(authOptions)

    const invoice = await prisma.document.create({
        data: {
            type: 'Sales',
            referenceNo: referenceNo || '',
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
                    contactId: !!contact ? Number(contactId) : undefined,
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
                        create: items.map((item) => ({
                            pricePerUnit: item.pricePerUnit,
                            quantity: item.quantity,
                            unit: item.unit,
                            vat:
                                (item.quantity * item.quantityPerUnit * 7) /
                                107,
                            barcode: item.barcode,
                            description: item.detail,
                            name: item.name,
                            goodsMasterId: item.goodsMasterId,
                            quantityPerUnit: item.quantityPerUnit,
                            serviceAndNonStockItemId:
                                item.serviceAndNonStockItemId,
                            skuMasterId: item.skuMasterId,
                        })),
                    },
                },
            },
        },
    })

    revalidatePath('/sales/sales-order')
    redirect(`/sales/sales-order/${invoice.documentNo}`)
}
