'use server'

import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import {
    calculateApPaymentStatus,
    calculateArPaymentStatus,
} from '@/lib/calculate-payment-status'
import { generateDocumentNumber } from '@/lib/generateDocumentNumber'
import { AccountType, AssetType } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export type OtherInvoiceItems = {}

export const createOtherInvoice = async (
    formData: FormData,
    items: {
        chartOfAccountId: number
        chartOfAccountName: string
        amount: number
        chartOfAccountType: AccountType
        assetName?: string
        assetUsefulLife?: number
        assetResidualValue?: number
        assetType: AssetType | undefined
    }[],
    payments: {
        id: number
        amount: number
    }[],
    remarks: { id?: number; remark: string }[]
) => {
    const validator = z.object({
        contactId: z.string().trim().optional(),
        contactName: z.string().trim().optional(),
        address: z.string().trim().optional(),
        phone: z.string().trim().optional().nullable(),
        taxId: z.string().trim().optional().nullable(),
        date: z.string().trim().min(1, 'date must not be empty'),
        documentNo: z.string().trim().optional().nullable(),
        referenceNo: z.string().trim().optional().nullable(),
    })

    let {
        contactId,
        contactName,
        address,
        phone,
        taxId,
        date,
        documentNo,
        referenceNo,
    } = await validator.parse({
        contactId: formData.get('contactId') || undefined,
        contactName: formData.get('contactName') || undefined,
        address: formData.get('address') || undefined,
        phone: formData.get('phone') || undefined,
        taxId: formData.get('taxId') || undefined,
        date: formData.get('date'),
        documentNo: formData.get('documentNo') || undefined,
        referenceNo: formData.get('referenceNo') || undefined,
    })

    if (!documentNo) documentNo = await generateDocumentNumber('INV', date)

    const createdBy = await getServerSession(authOptions)

    const document = await prisma.document.create({
        data: {
            date: new Date(date),
            documentNo: documentNo,
            type: 'OtherInvoice',
            createdBy:
                createdBy?.user.first_name + ' ' + createdBy?.user.last_name,
            // contactId,
            address: address || '',
            contactName: contactName || '',
            phone: phone || '',
            taxId: taxId || '',
            remark: { create: remarks },
            referenceNo: referenceNo,
            GeneralLedger: {
                create: [
                    ...items
                        .filter((item) => !item.assetType)
                        .map((item) => ({
                            chartOfAccountId: item.chartOfAccountId,
                            amount: item.amount,
                        })),
                    ...items
                        .filter((item) => item.assetType)
                        .map((item) => ({
                            chartOfAccountId: item.chartOfAccountId,
                            amount: item.amount,
                            AssetMovement: {
                                create: items
                                    .filter((item) => item.assetType)
                                    .map((item) => ({
                                        AssetRegistration: {
                                            create: {
                                                acquisitionDate: new Date(date),
                                                name: item.assetName as string,
                                                description: '',
                                                remark: '',
                                                type: item.assetType as AssetType,
                                                usefulLife:
                                                    item.assetUsefulLife,
                                            },
                                        },
                                        date: new Date(date),
                                        value: item.amount,
                                    })),
                            },
                        })),
                    ...payments.map((payment) => {
                        return {
                            chartOfAccountId: payment.id,
                            amount: -payment.amount,
                        }
                    }),
                ],
            },
            // ApSubledger: !!contactId
            //     ? { create: { contactId: Number(contactId) } }
            //     : undefined,
            ApSubledger: !!contactId
                ? {
                      create: {
                          contactId: Number(contactId),
                          paymentStatus: calculateApPaymentStatus(payments),
                      },
                  }
                : undefined,
            // AssetMovement: {
            //     create: items
            //         .filter((item) => item.assetType)
            //         .map((item) => ({
            //             AssetRegistration: {
            //                 create: {
            //                     acquisitionDate: new Date(date),
            //                     name: item.assetName as string,
            //                     description: '',
            //                     remark: '',
            //                     type: item.assetType as AssetType,
            //                     usefulLife: item.assetUsefulLife,
            //                 },
            //             },
            //             date: new Date(date),
            //             value: item.amount,
            //         })),
            // },
        },
    })

    revalidatePath('/accounting/other-invoice')
    redirect('/accounting/other-invoice/')
}
