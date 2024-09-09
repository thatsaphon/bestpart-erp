'use server'

import prisma from '@/app/db/db'

export const deleteSalesReceived = async (documentNo: string) => {
    const salesReceived = await prisma.document.findFirstOrThrow({
        where: {
            documentNo,
        },
        include: {
            SalesReceived: true,
        },
    })

    const deleteSalesReceived = prisma.salesBill.delete({
        where: {
            id: salesReceived.SalesReceived?.id,
        },
    })
    const deleteDocument = prisma.document.delete({
        where: {
            documentNo,
        },
    })

    await prisma.$transaction([deleteSalesReceived, deleteDocument])
}
