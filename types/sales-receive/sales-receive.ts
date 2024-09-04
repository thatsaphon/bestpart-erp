import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getSalesReceiveDefaultFunction = async (
    where: Prisma.DocumentWhereInput
) => {
    return await prisma.document.findMany({
        where,
        include: {
            SalesReceived: {
                include: {
                    Contact: true,
                    Sales: {
                        include: {
                            SalesItem: true,
                            Document: true,
                        },
                    },
                    SalesReturn: {
                        include: {
                            SalesReturnItem: true,
                            Document: true,
                        },
                    },
                    SalesBill: {
                        include: {
                            Document: true,
                            Sales: {
                                include: {
                                    SalesItem: true,
                                },
                            },
                            SalesReturn: {
                                include: {
                                    SalesReturnItem: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    })
}

export type getSalesReceive = Awaited<
    ReturnType<typeof getSalesReceiveDefaultFunction>
>[number]
