'use server'

import prisma from '@/app/db/db'

export const getChartOfAccountHistory = async (chartOfAccountId: number) => {
    const chartOfAccount = await prisma.chartOfAccount.findUnique({
        where: {
            id: chartOfAccountId,
        },
        include: {
            GeneralLedger: {
                include: {
                    CustomerOrder: {
                        include: {
                            Document: true,
                        },
                    },
                    Sales: {
                        include: {
                            Document: true,
                        },
                    },
                    Purchase: {
                        include: {
                            Document: true,
                        },
                    },
                    SalesReturn: {
                        include: {
                            Document: true,
                        },
                    },
                    PurchaseReturn: {
                        include: {
                            Document: true,
                        },
                    },
                    SalesReceived: {
                        include: {
                            Document: true,
                        },
                    },
                    JournalVoucher: {
                        include: {
                            Document: true,
                        },
                    },
                    OtherInvoice: {
                        include: {
                            Document: true,
                        },
                    },
                    OtherPayment: {
                        include: {
                            Document: true,
                        },
                    },
                    PurchasePayment: {
                        include: {
                            Document: true,
                        },
                    },
                },
            },
        },
    })
    if (!chartOfAccount) return []
    return chartOfAccount.GeneralLedger.map((generalLedger) => {
        return {
            ...generalLedger,
            Document:
                generalLedger.CustomerOrder?.Document ||
                generalLedger.JournalVoucher?.Document ||
                generalLedger.OtherInvoice?.Document ||
                generalLedger.OtherPayment?.Document ||
                generalLedger.PurchasePayment?.Document ||
                generalLedger.Purchase?.Document ||
                generalLedger.PurchaseReturn?.Document ||
                generalLedger.Sales?.Document ||
                generalLedger.SalesReceived?.Document ||
                generalLedger.SalesReturn?.Document,
        }
    }).sort((a, b) => b.Document!.date.getTime() - a.Document!.date.getTime())
    // const history = await prisma.document.findMany({
    //     where: {

    //     }
    // })
}
