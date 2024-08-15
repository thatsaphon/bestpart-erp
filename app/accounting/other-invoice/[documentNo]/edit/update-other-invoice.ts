'use server'

import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import {
    calculateApPaymentStatus,
    calculateArPaymentStatus,
} from '@/lib/calculate-payment-status'
import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { AccountType, AssetType, Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export type OtherInvoiceItems = {}

export const updateOtherInvoice = async (
    formData: FormData,
    id: number,
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
    remarks: { id?: number; remark: string; isDeleted?: boolean }[]
) => {
    const validator = z.object({
        contactId: z.string().trim().optional(),
        contactName: z.string().trim().optional(),
        address: z.string().trim().optional(),
        phone: z.string().trim().optional().nullable(),
        taxId: z.string().trim().optional().nullable(),
        date: z.string().trim().min(1, 'date must not be empty'),
        documentNo: z.string().trim().optional(),
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

    const document = await prisma.document.findUnique({
        where: {
            id,
        },
        include: {
            OtherInvoice: {
                include: {
                    Contact: true,
                    GeneralLedger: true,
                    OtherInvoiceItem: {
                        include: {
                            AssetMovement: {
                                include: {
                                    Asset: { include: { AssetMovement: true } },
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    if (!document) {
        throw new Error('Document not found')
    }
    // if (document.ApSubledger?.paymentStatus === 'Billed') {
    //     throw new Error('Document has already been billed')
    // }

    const assets = await prisma.asset.findMany({
        where: {
            id: {
                in: document.OtherInvoice?.OtherInvoiceItem.filter(
                    (item) => item.AssetMovement
                ).map((item) => item.AssetMovement?.Asset.id as number),
            },
        },
        include: {
            AssetMovement: true,
        },
    })

    for (let asset of assets) {
        if (asset.AssetMovement.length > 1)
            throw new Error(
                `มีการเปลี่ยนแปลงของ ${asset.name} แล้ว ไม่สามารถแก้ไขได้`
            )
    }

    const createdBy = await getServerSession(authOptions)

    const deleteGL = prisma.generalLedger.deleteMany({
        where: {
            id: {
                in: document.OtherInvoice?.GeneralLedger.map((item) => item.id),
            },
        },
    })

    const deleteAsset = prisma.asset.deleteMany({
        where: {
            id: {
                in: document.OtherInvoice?.OtherInvoiceItem.filter(
                    (item) => item.AssetMovement
                ).map((item) => item.AssetMovement?.Asset.id as number),
            },
        },
    })

    const deleteAssetMovement = prisma.assetMovement.deleteMany({
        where: {
            assetId: {
                in: document.OtherInvoice?.OtherInvoiceItem.filter(
                    (item) => item.AssetMovement
                ).map((item) => item.AssetMovement?.Asset.id as number),
            },
        },
    })

    const deleteOtherInvoiceItem = prisma.otherInvoiceItem.deleteMany({
        where: {
            id: {
                in: document.OtherInvoice?.OtherInvoiceItem.map(
                    (item) => item.id
                ),
            },
        },
    })

    const update = prisma.document.update({
        where: {
            id,
        },
        data: {
            date: new Date(date),
            documentNo: documentNo,
            type: 'OtherInvoice',
            updatedBy:
                createdBy?.user.first_name + ' ' + createdBy?.user.last_name,
            // contactId,
            address: address || '',
            contactName: contactName || '',
            phone: phone || '',
            taxId: taxId || '',
            remark: {
                create: remarks.filter(({ id }) => !id),
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
            referenceNo: referenceNo,
            OtherInvoice: {
                update: {
                    contactId: Number(contactId),
                    //PENDING
                    // GeneralLedger: {
                    //     create: [
                    //         ...items
                    //             .filter((item) => !item.assetType)
                    //             .map((item) => ({
                    //                 chartOfAccountId: item.chartOfAccountId,
                    //                 amount: item.amount,
                    //             })),
                    //         ...payments.map((payment) => {
                    //             return {
                    //                 chartOfAccountId: payment.id,
                    //                 amount: -payment.amount,
                    //             }
                    //         }),
                    //     ],
                    // },
                    // OtherInvoiceItem: {
                    //     create:{

                    //     }
                    // }
                },
            },
            // GeneralLedger: {
            //     create: [
            //         ...items
            //             .filter((item) => !item.assetType)
            //             .map((item) => ({
            //                 chartOfAccountId: item.chartOfAccountId,
            //                 amount: item.amount,
            //             })),
            //         ...payments.map((payment) => {
            //             return {
            //                 chartOfAccountId: payment.id,
            //                 amount: -payment.amount,
            //             }
            //         }),
            //     ],
            // },
            // ApSubledger: !!contactId
            //     ? {
            //           create: {
            //               contactId: Number(contactId),
            //               paymentStatus: calculateApPaymentStatus(payments),
            //           },
            //       }
            //     : undefined,
        },
    })

    // const createAssetMovement = prisma.assetMovement.create({
    //     data: items
    //         .filter((item) => item.assetType)
    //         .map((item) => ({
    //             date: new Date(date),
    //             value: item.amount,
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
    //             documentId: document.id,
    //             generalLedgerId: item.chartOfAccountId,
    //         })),
    // })

    const createAssets = prisma.$queryRawUnsafe(`
        INSERT INTO AssetRegistration (acquisitionDate, name, description, remark, type, usefulLife) VALUES
        ${items
            .filter((item) => item.assetType)
            .map(
                (item) =>
                    `('${date}', '${item.assetName}', '', '', '${item.assetType}', ${item.assetUsefulLife})`
            )
            .join(',')}
        `)

    // const createAssetMovement

    await prisma.$transaction([
        deleteGL,
        deleteAsset,
        deleteAssetMovement,
        deleteOtherInvoiceItem,
        update,
        // createAssetMovement,
    ])

    revalidatePath('/accounting/other-invoice')
    redirect('/accounting/other-invoice/')
}
