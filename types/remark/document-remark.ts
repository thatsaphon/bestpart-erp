import { Prisma } from '@prisma/client'
import prisma from '@/app/db/db'

export const getDocumentRemarkDefaultFunction = async (
    where: Prisma.DocumentRemarkWhereInput
) => {
    return await prisma.documentRemark.findMany({
        where: where,
        include: {
            User: true,
        },
    })
}

export type GetDocumentRemark = Awaited<
    ReturnType<typeof getDocumentRemarkDefaultFunction>
>[number]

export const defaultDocumentRemark = (): GetDocumentRemark => {
    return {
        id: 0,
        documentId: 0,
        remark: '',
        userId: '',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        User: null,
    }
}
