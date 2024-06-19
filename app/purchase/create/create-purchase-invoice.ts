'use server'

import prisma from '@/app/db/db'
import { format } from 'date-fns'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { generateDocumentNumber } from '@/lib/generateDocumentNumber'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { InventoryDetailType } from '@/types/inventory-detail'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const createPurchaseInvoice = async (
    formData: FormData,
    items: InventoryDetailType[]
) => {
    const validator = z.object({
        vendorId: z.string().trim().min(1, 'vendorId must not be empty'),
        contactName: z.string().trim().min(1, 'contactName must not be empty'),
        address: z.string().trim().optional().nullable(),
        phone: z.string().trim().optional().nullable(),
        taxId: z.string().trim().optional().nullable(),
        date: z.string().trim().min(1, 'date must not be empty'),
        documentId: z.string().trim().optional().nullable(),
        referenceId: z.string().trim().optional().nullable(),
    })

    const result = validator.safeParse({
        vendorId: formData.get('vendorId'),
        contactName: formData.get('contactName'),
        address: formData.get('address'),
        phone: formData.get('phone'),
        taxId: formData.get('taxId'),
        date: formData.get('date'),
        documentId: formData.get('documentId'),
        referenceId: formData.get('referenceId'),
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

    let { vendorId, contactName, address, phone, taxId, date, documentId, referenceId } = result.data

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

    const invoice = await prisma.document.create({
        data: {
            contactName: contactName || '',
            address: address || '',
            phone: phone || '',
            taxId: taxId || '',
            date: new Date(date),
            documentId: documentId,
            referenceId: referenceId,
            type: 'Purchase',
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
                        amount: -items.reduce(
                            (sum, item) => sum + item.quantity * item.price,
                            0
                        ),
                    },
                    // สินค้าคงเหลือ
                    {
                        chartOfAccountId: 13000,
                        amount: +items
                            .reduce(
                                (sum, item) =>
                                    sum +
                                    (item.quantity * item.price * 100) / 107,
                                0
                            )
                            .toFixed(2),
                    },
                    // ภาษีซื้อ
                    {
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
                ],
            },
            SkuIn: {
                create: items.map((item) => ({
                    date: new Date(date),
                    goodsMasterId: goodsMasters.find(
                        (goodsMaster) => goodsMaster.barcode === item.barcode
                    )?.id as number,
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
                })),
            },
        },
    })

    await prisma.contact.update({
        where: {
            id: Number(vendorId),
        },
        data: {
            SkuMaster: {
                connect: items.map((item) => ({ id: item.skuMasterId })),
            }
        },
    })

    revalidatePath('/purchase')
    redirect(`/purchase/${invoice.documentId}`)
}
