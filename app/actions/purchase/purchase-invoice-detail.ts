'use server'

import prisma from '@/app/db/db'

export const getPurchaseInvoiceDetail = async (documentNo: string) => {
    return await prisma.document.findUnique({
        where: { documentNo },
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
            remark: true,
        },
    })
}
