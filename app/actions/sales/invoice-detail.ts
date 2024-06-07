'use server'

import prisma from '@/app/db/db'

export const getSalesInvoiceDetail = async (documentId: string) => {
    return await prisma.document.findUnique({
        where: { documentId },
        include: {
            ArSubledger: { include: { Contact: true } },
            SkuOut: {
                include: {
                    GoodsMaster: {
                        include: { SkuMaster: { include: { mainSku: true } } },
                    },
                },
            },
            GeneralLedger: true,
            remark: true,
        },
    })
}
