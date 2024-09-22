'use server'

import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getCustomerOrderDefaultFunction = async (
    where: Prisma.DocumentWhereInput
) => {
    return await prisma.document.findMany({
        where,
        include: {
            CustomerOrder: {
                include: {
                    CustomerOrderItem: true,
                    Contact: true,
                    GeneralLedger: {
                        include: { ChartOfAccount: true },
                    },
                    PurchaseOrder: true,
                    SalesLink: true,
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

export type GetCustomerOrder = Awaited<
    ReturnType<typeof getCustomerOrderDefaultFunction>
>[number]
