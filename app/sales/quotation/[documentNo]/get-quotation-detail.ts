'use server'

import prisma from '@/app/db/db'

export default async function getQuotationDetail(documentNo: string) {
    const quotation = await prisma.document.findUnique({
        where: { documentNo },
        include: {
            Quotation: {
                include: {
                    Contact: true,
                    QuotationItem: {
                        include: {
                            GoodsMaster: {
                                include: {
                                    SkuMaster: { include: { MainSku: true } },
                                },
                            },
                        },
                    },
                },
            },
            DocumentRemark: true,
        },
    })
    return quotation
}
