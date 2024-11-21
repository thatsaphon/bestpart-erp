'use server'

import prisma from '@/app/db/db'
import { redirect } from 'next/navigation'

export const deleteSalesReceived = async (documentNo: string) => {
    const salesReceived = await prisma.document.findFirstOrThrow({
        where: {
            documentNo,
        },
        include: {
            SalesReceived: true,
        },
    })

    const deleteGeneralLedger = prisma.generalLedger.deleteMany({
        where: {
            salesReceivedId: salesReceived.SalesReceived?.id,
        },
    })
    const deleteSalesReceived = prisma.salesReceived.delete({
        where: {
            id: salesReceived.SalesReceived?.id,
        },
    })
    const deleteDocument = prisma.document.delete({
        where: {
            documentNo,
        },
    })

    await prisma.$transaction([
        deleteGeneralLedger,
        deleteSalesReceived,
        deleteDocument,
    ])
    redirect('/sales/sales-received')
}
