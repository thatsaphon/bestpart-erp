'use server'

import prisma from '@/app/db/db'
import { redirect } from 'next/navigation'

export default async function deleteOtherInvoice(documentNo: string) {
    const document = await prisma.document.findUnique({
        where: {
            documentNo,
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

    if (!document || !document.OtherInvoice) {
        throw new Error('Document not found')
    }
    for (let item of document.OtherInvoice.OtherInvoiceItem || []) {
        if (
            item.AssetMovement &&
            item.AssetMovement?.Asset.AssetMovement.length > 1
        ) {
            throw new Error(
                'มีการเปลี่ยนแปลงมูลค่าของสินทรัพย์ กรุณาลบการเปลี่ยนแปลงมูลค่าก่อน'
            )
        }
    }

    const deleteGeneralLedger = prisma.generalLedger.deleteMany({
        where: {
            id: {
                in: document.OtherInvoice.GeneralLedger.map((gl) => gl.id),
            },
        },
    })
    const deleteAssetMovement = prisma.assetMovement.deleteMany({
        where: {
            // documentId: document.id,
            assetId: {
                in: document.OtherInvoice?.OtherInvoiceItem.filter(
                    (item) => item.AssetMovement
                ).map((item) => item.AssetMovement?.Asset.id as number),
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

    const deleteOtherInvoice = prisma.otherInvoice.delete({
        where: {
            id: document.OtherInvoice.id,
        },
    })

    const deleteDocument = prisma.document.delete({
        where: {
            documentNo,
        },
    })

    await prisma.$transaction([
        deleteAssetMovement,
        deleteAsset,
        deleteGeneralLedger,
        deleteOtherInvoice,
        deleteDocument,
    ])

    redirect('/accounting/other-invoice')
}
