'use server'

import prisma from '@/app/db/db'

export const getSalesReturnInvoiceDetail = async (documentNo: string) => {
    return await prisma.document.findUnique({
        where: { documentNo },
        include: {
            ArSubledger: { include: { Contact: true } },
            SkuIn: {
                include: {
                    GoodsMaster: {
                        include: { SkuMaster: { include: { mainSku: true } } },
                    },
                },
            },
            GeneralLedger: { include: { ChartOfAccount: true } },
            remark: true,
        },
    })
}
