'use server'

import prisma from '@/app/db/db'

export const getPurchaseInvoiceDetail = async (documentNo: string) => {
    return await prisma.document.findUnique({
        where: { documentNo },
        include: {
            Purchase: {
                include: {
                    Contact: true,
                    GeneralLedger: true,
                    PurchasePayment: true,
                    PurchaseOrder: true,
                    PurchaseItem: {
                        include: {
                            GoodsMaster: true,
                            ServiceAndNonStockItem: true,
                            SkuMaster: { include: { MainSku: true } },
                        },
                    },
                },
            },
            DocumentRemark: {
                include: {
                    User: true,
                },
            },
        },
    })
}
