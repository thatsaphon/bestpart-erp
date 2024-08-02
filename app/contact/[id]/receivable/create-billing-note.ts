'use server'

import { generateDocumentNumber } from '@/lib/generateDocumentNumber'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import { getServerSession } from 'next-auth/next'
import { create } from 'node:domain'
import { z } from 'zod'

export const createBillingNote = async (
    formData: FormData,
    documentNos: string[]
) => {
    const validator = z.object({
        customerId: z.string().trim(),
        address: z.string().trim().optional().nullable(),
        phone: z.string().trim().optional().nullable(),
        taxId: z.string().trim().optional().nullable(),
        date: z.string().trim().min(1, 'date must not be empty'),
        documentNo: z.string().trim().optional().nullable(),
        remark: z.string().trim().optional().nullable(),
    })

    let { customerId, address, phone, taxId, date, documentNo, remark } =
        validator.parse({
            customerId: formData.get('customerId'),
            address: formData.get('address'),
            phone: formData.get('phone'),
            taxId: formData.get('taxId'),
            date: formData.get('date'),
            documentNo: formData.get('documentNo'),
            payment: formData.get('payment'),
            remark: formData.get('remark'),
        })
    const documents = await prisma.document.findMany({
        where: {
            documentNo: {
                in: documentNos,
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
        if (!documentNos.includes(document.documentNo))
            throw new Error(`${document.documentNo} is not in documentNos`)

        if (document.ArSubledger?.contactId !== +customerId) {
            throw new Error(
                `${document.documentNo} is not linked to coustomerId: ${customerId}`
            )
        }

        if (
            document.ArSubledger.paymentStatus === 'Paid' ||
            document.ArSubledger.paymentStatus === 'Billed' ||
            document.ArSubledger.paymentStatus === 'Cash'
        ) {
            throw new Error(
                `${document.documentNo} is already ${document.ArSubledger.paymentStatus}`
            )
        }
    }

    if (!documentNo) {
        documentNo = await generateDocumentNumber('BILL', date)
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
            documentNo: documentNo,
            createdBy: session?.user.first_name,
            updatedBy: session?.user.first_name,
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
            remark: `วางบิลเลขที่ ${documentNo}`,
            documentId: document.id,
        })),
    })
    const transaction = await prisma.$transaction([
        createBillingNote,
        updatePaymentStatus,
        createRemark,
    ])
}
