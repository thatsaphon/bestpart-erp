'use server'

import { generateDocumentNumber } from '@/app/actions/sales/create-invoice'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import { getServerSession } from 'next-auth/next'
import { create } from 'node:domain'
import { z } from 'zod'

export const createBillingNote = async (
    formData: FormData,
    documentIds: string[]
) => {
    const validator = z.object({
        customerId: z.string().trim(),
        address: z.string().trim().optional().nullable(),
        phone: z.string().trim().optional().nullable(),
        taxId: z.string().trim().optional().nullable(),
        date: z.string().trim().min(1, 'date must not be empty'),
        documentId: z.string().trim().optional().nullable(),
        payment: z.enum(['cash', 'transfer', 'credit']).default('cash'),
        remark: z.string().trim().optional().nullable(),
    })

    let {
        customerId,
        address,
        phone,
        taxId,
        date,
        documentId,
        payment,
        remark,
    } = validator.parse({
        customerId: formData.get('customerId'),
        address: formData.get('address'),
        phone: formData.get('phone'),
        taxId: formData.get('taxId'),
        date: formData.get('date'),
        documentId: formData.get('documentId'),
        payment: formData.get('payment'),
        remark: formData.get('remark'),
    })
    const documents = await prisma.document.findMany({
        where: {
            documentId: {
                in: documentIds,
            },
        },
        include: {
            GeneralLedger: {
                where: {
                    OR: [
                        // { chartOfAccountId: 11000 },
                        { chartOfAccountId: 12000 },
                    ],
                },
            },
            ArSubledger: true,
        },
    })

    for (const document of documents) {
        if (!documentIds.includes(document.documentId))
            throw new Error(`${document.documentId} is not in documentIds`)

        if (document.ArSubledger?.contactId !== +customerId) {
            throw new Error(
                `${document.documentId} is not linked to coustomerId: ${customerId}`
            )
        }

        if (
            document.ArSubledger.paymentStatus === 'Paid' ||
            document.ArSubledger.paymentStatus === 'Billed' ||
            document.ArSubledger.paymentStatus === 'Cash'
        ) {
            throw new Error(
                `${document.documentId} is already ${document.ArSubledger.paymentStatus}`
            )
        }
    }

    if (!documentId) {
        documentId = await generateDocumentNumber('BILL', date)
    }
    const session = await getServerSession(authOptions)

    const createBillingNote = prisma.document.create({
        data: {
            contactName: address?.split('\n')[0] || '',
            address: address?.substring(address.indexOf('\n') + 1) || '',
            phone: phone || '',
            taxId: taxId || '',
            type: 'BillingNote',
            date: new Date(date),
            documentId: documentId,
            remark: remark ? { create: { remark } } : undefined,
            createdBy: session?.user.username,
            updatedBy: session?.user.username,
            ArSubledger: {
                create: {
                    contactId: +customerId,
                    paymentStatus: 'NotPaid',
                },
            },
            GeneralLedger: {
                connect: [
                    ...documents.map((document) => ({
                        id: document.GeneralLedger[0].id,
                    })),
                ],
            },
        },
        select: {
            id: true,
            documentId: true,
        },
    })

    const updatePaymentStatus = prisma.arSubledger.updateMany({
        where: {
            documentId: {
                in: documents.map((document) => document.id),
            },
        },
        data: {
            paymentStatus: 'Billed',
        },
    })

    const createRemark = prisma.documentRemark.createMany({
        data: documents.map((document) => ({
            remark: `วางบิลเลขที่ ${documentId}`,
            documentId: document.id,
        })),
    })
    const transaction = await prisma.$transaction([
        createBillingNote,
        updatePaymentStatus,
        createRemark,
    ])
}
