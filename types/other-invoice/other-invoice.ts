'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getOtherInvoiceDefaultFunction = async (
    where: Prisma.DocumentWhereInput,
    page: {
        orderBy?: Prisma.Enumerable<Prisma.DocumentOrderByWithRelationInput>
        take?: number
        skip?: number
    } = {}
) => {
    const { orderBy, take, skip } = page
    return await prisma.document.findMany({
        where,
        include: {
            OtherInvoice: {
                include: {
                    OtherInvoiceItem: {
                        include: {
                            ServiceAndNonStockItem: true,
                        },
                    },
                    Contact: true,
                    GeneralLedger: {
                        include: {
                            ChartOfAccount: true,
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
        orderBy,
        take,
        skip,
    })
}

export type GetOtherInvoice = Awaited<
    ReturnType<typeof getOtherInvoiceDefaultFunction>
>[number]
