'use server'

import prisma from '@/app/db/db'
import { revalidatePath } from 'next/cache'

export const updateRemark = async (documentId: number, remark: string) => {
    const document = await prisma.documentRemark.create({
        data: {
            documentId,
            remark
        },
    })

    revalidatePath(`/sales/${document.documentId}`)
    return document
}