'use server'

import prisma from '@/app/db/db'

export async function fetchUnpaidSalesInvoice(contactId: number) {
    const unpaidSalesInvoice = await prisma.document.findMany({
        where: {
            type: 'Sales',
            ArSubledger: {
                paymentStatus: 'NotPaid',
                contactId,
            },
        },
        include: {
            ArSubledger: true,
            GeneralLedger: {
                where: {
                    chartOfAccountId: 12000,
                },
            },
        },
    })
    return unpaidSalesInvoice
}
