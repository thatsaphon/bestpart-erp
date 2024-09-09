'use server'

import prisma from '@/app/db/db'

export const getUnpaidBills = async (contactId: number) => {
    return prisma.document.findMany({
        where: {
            OR: [
                {
                    Sales: {
                        contactId: contactId,
                        GeneralLedger: {
                            some: {
                                ChartOfAccount: {
                                    isAr: true,
                                },
                            },
                        },
                        salesBillId: null,
                        salesReceivedId: null,
                    },
                },
                {
                    SalesReturn: {
                        contactId: contactId,
                        GeneralLedger: {
                            some: {
                                ChartOfAccount: {
                                    isAr: true,
                                },
                            },
                        },
                        salesBillId: null,
                        salesReceivedId: null,
                    },
                },
                {
                    SalesBill: {
                        contactId: contactId,
                        salesReceivedId: null,
                    },
                },
            ],
        },
        include: {
            Sales: {
                include: {
                    SalesItem: true,
                    GeneralLedger: {
                        include: {
                            ChartOfAccount: true,
                        },
                    },
                },
            },
            SalesReturn: {
                include: {
                    SalesReturnItem: true,
                    GeneralLedger: {
                        include: {
                            ChartOfAccount: true,
                        },
                    },
                },
            },
            SalesBill: {
                include: {
                    Sales: {
                        include: {
                            SalesItem: true,
                            GeneralLedger: {
                                include: {
                                    ChartOfAccount: true,
                                },
                            },
                        },
                    },
                    SalesReturn: {
                        include: {
                            SalesReturnItem: true,
                            GeneralLedger: {
                                include: {
                                    ChartOfAccount: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    })
}

export type getUnpaidBills = Awaited<ReturnType<typeof getUnpaidBills>>[number]
