import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export const getPurchasePaymentDefaultFunction = async (
    where: Prisma.DocumentWhereInput
) => {
    return await prisma.document.findMany({
        where,
        include: {
            PurchasePayment: {
                include: {
                    Contact: true,
                    Purchase: {
                        include: {
                            PurchaseItem: true,
                            Document: true,
                            GeneralLedger: {
                                include: { ChartOfAccount: true },
                            },
                        },
                    },
                    PurchaseReturn: {
                        include: {
                            PurchaseReturnItem: true,
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
    })
}

export type GetPurchasePayment = Awaited<
    ReturnType<typeof getPurchasePaymentDefaultFunction>
>[number]
