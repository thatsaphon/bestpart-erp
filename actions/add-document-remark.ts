'use server'

import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { revalidateDocumentType } from './revalidate-document-type'

export const addDocumentRemark = async (documentId: number, remark: string) => {
    const session = await getServerSession(authOptions)
    const result = await prisma.documentRemark.create({
        data: {
            documentId: documentId,
            remark: remark,
            userId: session?.user.id,
        },
        include: {
            Document: true,
        },
    })

    revalidateDocumentType(result.Document?.type, result.Document?.documentNo)
}
