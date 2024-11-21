'use server'

import prisma from '@/app/db/db'

export const getUnpaidPurchases = async (contactId: number) => {
    return prisma.document.findMany({
        where: {
            OR: [
                {
                    Purchase: {
                        contactId: contactId,
                        GeneralLedger: {
                            some: {
                                ChartOfAccount: {
                                    isAp: true,
                                },
                            },
                        },
                        purchasePaymentId: null,
                    },
                },
                {
                    PurchaseReturn: {
                        contactId: contactId,
                        GeneralLedger: {
                            some: {
                                ChartOfAccount: {
                                    isAp: true,
                                },
                            },
                        },
                        purchasePaymentId: null,
                    },
                },
            ],
        },
        include: {
            Purchase: {
                include: {
                    PurchaseItem: true,
                    GeneralLedger: {
                        include: {
                            ChartOfAccount: true,
                        },
                    },
                },
            },
            PurchaseReturn: {
                include: {
                    PurchaseReturnItem: true,
                    GeneralLedger: {
                        include: {
                            ChartOfAccount: true,
                        },
                    },
                },
            },
        },
    })
}

export type GetUnpaidPurchase = Awaited<
    ReturnType<typeof getUnpaidPurchases>
>[number]
