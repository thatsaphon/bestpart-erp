'use server'

import prisma from '@/app/db/db'

export default async function getCustomerOrderDetail(documentNo: string) {
    const quotation = await prisma.document.findUnique({
        where: { documentNo },
        include: {
            CustomerOrder: {
                include: {
                    Contact: true,
                    CustomerOrderItem: true,
                    PurchaseOrder: true,
                    GeneralLedger: {
                        where: {
                            chartOfAccountId: {
                                //เงินมัดจำ = 22300
                                not: 22300,
                            },
                        },
                        include: { ChartOfAccount: true },
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
    return quotation
}
