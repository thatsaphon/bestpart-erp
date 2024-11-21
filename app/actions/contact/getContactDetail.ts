'use server'

import prisma from '@/app/db/db'

export const getContactDetail = async (id: string) => {
    return await prisma.contact.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            CustomerOrder: {
                include: {
                    CustomerOrderItem: true,
                },
            },
            OtherInvoice: {
                include: {
                    OtherInvoiceItem: true,
                },
            },
            PurchaseOrder: {
                include: {
                    PurchaseOrderItem: true,
                },
            },
            Purchase: {
                include: {
                    PurchaseItem: true,
                },
            },
            PurchasePayment: {
                include: {
                    Purchase: {
                        include: {
                            PurchaseItem: true,
                        },
                    },
                    PurchaseReturn: {
                        include: {
                            PurchaseReturnItem: true,
                        },
                    },
                },
            },
            PurchaseReturn: {
                include: {
                    PurchaseReturnItem: true,
                },
            },
            Quotation: {
                include: {
                    QuotationItem: true,
                },
            },
            Sales: {
                include: {
                    SalesItem: true,
                },
            },
            SalesBill: {
                include: {
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
            SalesReceived: {
                include: {
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
                    SalesBill: {
                        include: {
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
            SalesReturn: {
                include: {
                    SalesReturnItem: true,
                },
            },
            SkuMaster: {
                include: {
                    MainSku: true,
                },
            },
            StockMovement: {
                include: {
                    Document: true,
                    SkuMaster: {
                        include: {
                            MainSku: true,
                        },
                    },
                },
            },
        },
    })
}
