'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getOtherPaymentDefaultFunction = async ({
    where,
    orderBy,
    take,
    skip,
}: {
    where?: Prisma.DocumentWhereInput
    orderBy?: Prisma.Enumerable<Prisma.DocumentOrderByWithRelationInput>
    take?: number
    skip?: number
} = {}) => {
    return await prisma.document.findMany({
        where,
        include: {
            OtherPayment: {
                include: {
                    Contact: true,
                    OtherInvoice: {
                        include: {
                            OtherInvoiceItem: true,
                            Document: true,
                            GeneralLedger: {
                                include: { ChartOfAccount: true },
                            },
                        },
                    },
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

export type GetOtherPayment = Awaited<
    ReturnType<typeof getOtherPaymentDefaultFunction>
>[number]
