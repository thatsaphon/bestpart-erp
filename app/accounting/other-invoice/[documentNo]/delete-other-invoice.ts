'use server'

import prisma from '@/app/db/db'
import { redirect } from 'next/navigation'

export default async function deleteOtherInvoice(documentNo: string) {
    const document = await prisma.document.findUnique({
        where: {
            documentNo,
        },
        include: {
            ApSubledger: { include: { Contact: true } },
            GeneralLedger: { include: { ChartOfAccount: true } },
            AssetMovement: {
                include: {
                    AssetRegistration: { include: { AssetMovement: true } },
                },
            },
        },
    })

    if (!document) {
        throw new Error('Document not found')
    }
    for (let { AssetRegistration: asset } of document.AssetMovement) {
        if (asset.AssetMovement.length > 1) {
            throw new Error(
                'มีการเปลี่ยนแปลงมูลค่าของสินทรัพย์ กรุณาลบการเปลี่ยนแปลงมูลค่าก่อน'
            )
        }
    }

    const deleteApSubledger = prisma.apSubledger.deleteMany({
        where: {
            documentId: document.id,
        },
    })
    const deleteGeneralLedger = prisma.generalLedger.deleteMany({
        where: {
            id: {
                in: document.GeneralLedger.map((gl) => gl.id),
            },
        },
    })
    const deleteAssetMovement = prisma.assetMovement.deleteMany({
        where: {
            documentId: document.id,
        },
    })
    const deleteAsset = prisma.assetRegistration.deleteMany({
        where: {
            id: {
                in: document.AssetMovement.map((am) => am.AssetRegistration.id),
            },
        },
    })

    const deleteDocument = prisma.document.delete({
        where: {
            documentNo,
        },
    })

    await prisma.$transaction([
        deleteApSubledger,
        deleteAssetMovement,
        deleteAsset,
        deleteGeneralLedger,
        deleteDocument,
    ])

    redirect('/accounting/other-invoice')
}
