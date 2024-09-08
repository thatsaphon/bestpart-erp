'use server'

import prisma from '@/app/db/db'

export const deleteSalesBill = async (documentNo: string) => {
    const salesBill = await prisma.document.findFirstOrThrow({
        where: {
            documentNo,
        },
        include: {
            SalesBill: true,
        },
    })

    const deleteSalesBill = prisma.salesBill.delete({
        where: {
            id: salesBill.SalesBill?.id,
        },
    })
    const deleteDocument = prisma.document.delete({
        where: {
            documentNo,
        },
    })

    await prisma.$transaction([deleteSalesBill, deleteDocument])
}
