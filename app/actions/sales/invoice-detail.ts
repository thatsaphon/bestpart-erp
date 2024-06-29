'use server'

import prisma from '@/app/db/db'

export const getSalesInvoiceDetail = async (documentNo: string) => {
    return await prisma.document.findUnique({
        where: { documentNo },
        include: {
            ArSubledger: { include: { Contact: true } },
            SkuOut: {
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
