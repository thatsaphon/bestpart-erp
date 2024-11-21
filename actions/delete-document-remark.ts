'use server'

import prisma from '@/app/db/db'
import { revalidateDocumentType } from './revalidate-document-type'

export const deleteDocumentRemark = async (id: number) => {
    const result = await prisma.documentRemark.update({
        where: {
            id: id,
        },
        data: {
            isDeleted: true,
        },
        include: {
            Document: true,
        },
    })

    revalidateDocumentType(result.Document?.type, result.Document?.documentNo)
}
