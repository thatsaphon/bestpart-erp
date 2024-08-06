'use server'

import prisma from '@/app/db/db'

export default async function getQuotationDetail(documentNo: string) {
    const quotation = await prisma.document.findUnique({
        where: { documentNo },
        include: {
            ArSubledger: { include: { Contact: true } },
            Quotation: {
                include: {
                    QuotationItem: {
                        include: {
                            GoodsMaster: {
                                include: {
                                    SkuMaster: { include: { mainSku: true } },
                                },
                            },
                        },
                    },
                },
            },
            remark: true,
        },
    })
    return quotation
}
