'use server'

import prisma from '@/app/db/db'

export const getOtherInvoiceDetail = async (documentNo: string) => {
    return await prisma.document.findUnique({
        where: { documentNo, type: 'OtherInvoice' },
        include: {
            OtherInvoice: {
                include: {
                    Contact: true,
                    OtherInvoiceItem: {
                        include: {
                            AssetMovement: { include: { Asset: true } },
                            ChartOfAccount: true,
                        },
                    },
                    GeneralLedger: true,
                },
            },
        },
    })
}
