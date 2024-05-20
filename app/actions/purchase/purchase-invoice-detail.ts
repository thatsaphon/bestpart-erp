'use server'

import prisma from '@/app/db/db'

export const getPurchaseInvoiceDetail = async (documentId: string) => {
    return await prisma.document.findUnique({
        where: { documentId },
        include: {
            ApSubledger: { include: { Contact: true } },
            SkuIn: {
                include: {
                    GoodsMaster: {
                        include: { SkuMaster: { include: { mainSku: true } } },
                    },
                },
            },
            GeneralLedger: true,
        },
    })
}
