'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getJournalVoucherDefaultFunction = ({
    where,
    orderBy,
    take,
    skip,
}: {
    where?: Prisma.DocumentWhereInput
    orderBy?: Prisma.Enumerable<Prisma.DocumentOrderByWithRelationInput>
    take?: number
    skip?: number
}) => {
    return prisma.document.findMany({
        where,
        include: {
            JournalVoucher: {
                include: {
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

export type GetJournalVoucher = Awaited<
    ReturnType<typeof getJournalVoucherDefaultFunction>
>[number]
