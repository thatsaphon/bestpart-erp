'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const addAssetMovement = async (
    assetId: number,
    // movementDetail: Prisma.AssetMovementCreateInput
    value: {
        date: Date
        documentNo: string
        value: number
        description?: string
    }
) => {
    const document = await prisma.document.findUniqueOrThrow({
        where: {
            documentNo: value.documentNo,
        },
        include: {
            JournalVoucher: true,
            OtherInvoice: true,
        },
    })

    if (!document.JournalVoucher && !document.OtherInvoice) {
        throw new Error('เอกสารไม่อยู่ในรายการปรับปรุงหรือใบเสร็จอื่นๆ')
    }

    await prisma.assetMovement.create({
        data: {
            assetId: assetId,
            date: value.date,
            value: value.value,
            description: value.description,
            journalVoucherId: document.JournalVoucher?.id,
            otherInvoiceId: document.OtherInvoice?.id,
        },
    })
    revalidatePath(`/accounting/asset-management/${assetId}`)
}
