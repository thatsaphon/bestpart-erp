'use server'

import prisma from '@/app/db/db'
import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { DocumentItem } from '@/types/document-item'
import { Contact } from '@prisma/client'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateQuotation(
    id: number,
    formData: FormData,
    items: DocumentItem[],
    remarks: { id?: number; remark: string; isDeleted?: boolean }[]
) {
    const validator = z.object({
        customerId: z.string().trim().nullable(),
        contactName: z.string().trim().optional(),
        address: z.string().trim().optional(),
        phone: z.string().trim().optional().nullable(),
        taxId: z.string().trim().optional().nullable(),
        date: z.string().trim().min(1, 'date must not be empty'),
        documentNo: z.string().trim().optional().nullable(),
    })

    const result = validator.safeParse({
        customerId: formData.get('customerId'),
        contactName: formData.get('contactName') || undefined,
        address: formData.get('address') || undefined,
        phone: formData.get('phone') || undefined,
        taxId: formData.get('taxId') || undefined,
        date: formData.get('date'),
        documentNo: formData.get('documentNo'),
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
    let { customerId, contactName, address, phone, taxId, date, documentNo } =
        result.data

    const quotation = await prisma.document.findUnique({
        where: {
            id,
        },
        include: {
            Quotation: true,
        },
    })
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
    if (!contact) {
        throw new Error('contact not found')
    }
    // const goodsMasters = await prisma.goodsMaster.findMany({
    //     where: {
    //         barcode: {
    //             in: items.map((item) => item.barcode).filter((barcode)=> typeof barcode === 'string'),
    //         },
    //     },
    // })

    if (!documentNo) {
        documentNo = await generateDocumentNumber('SQ', date)
    }
    const session = await getServerSession(authOptions)

    const updatedQuotation = await prisma.document.update({
        where: {
            id,
        },
        data: {
            contactName: contactName || '',
            type: 'Quotation',
            address: address || '',
            phone: phone || '',
            taxId: taxId || '',
            date: new Date(date),
            documentNo: documentNo,
            DocumentRemark: {
                create: remarks
                    .map(({ id, remark }) => ({
                        id,
                        remark,
                        userId: session?.user.id,
                    }))
                    .filter(({ id }) => !id),
                update: remarks
                    .filter(({ id }) => id)
                    .map((remark) => ({
                        where: { id: remark.id },
                        data: {
                            remark: remark.remark,
                            isDeleted: remark.isDeleted,
                        },
                    })),
            },
            createdBy: session?.user.first_name,
            updatedBy: session?.user.first_name,
            Quotation: {
                update: {
                    QuotationItem: {
                        deleteMany: {
                            quotationId: quotation?.Quotation?.id,
                        },
                        create: items.map((item) => ({
                            goodsMasterId: item.goodsMasterId,
                            skuMasterId: item.skuMasterId,
                            serviceAndNonStockItemId:
                                item.serviceAndNonStockItemId,
                            barcode: String(item.barcode),
                            name: item.name,
                            description: item.detail,
                            unit: item.unit,
                            quantityPerUnit: item.quantityPerUnit,
                            quantity: item.quantity,
                            pricePerUnit: +item.pricePerUnit.toFixed(2),
                            vat: +((7 / 107) * item.pricePerUnit).toFixed(2),
                        })),
                    },
                },
            },
        },
    })

    revalidatePath('/sales/quotation')
    redirect(`/sales/quotation/${updatedQuotation.documentNo}`)
}
