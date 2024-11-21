'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getQuotationDefaultFunction = async (
    where: Prisma.DocumentWhereInput
) => {
    return await prisma.document.findMany({
        where,
        include: {
            Quotation: {
                include: {
                    QuotationItem: {
                        include: {
                            SkuMaster: {
                                include: {
                                    MainSku: {
                                        include: {
                                            MainSkuRemark: true,
                                        },
                                    },
                                    SkuMasterRemark: true,
                                    Image: true,
                                },
                            },
                            GoodsMaster: true,
                            ServiceAndNonStockItem: {
                                include: {
                                    ChartOfAccount: true,
                                },
                            },
                        },
                    },
                    Contact: true,
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

export type GetQuotation = Awaited<
    ReturnType<typeof getQuotationDefaultFunction>
>[number]
