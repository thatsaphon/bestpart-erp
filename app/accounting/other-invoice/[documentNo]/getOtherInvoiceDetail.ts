'use server'

import prisma from '@/app/db/db'

export const getOtherInvoiceDetail = async (documentNo: string) => {
    return await prisma.document.findUnique({
        where: { documentNo },
        include: {
            ApSubledger: { include: { Contact: true } },
            // SkuOut: {
            //     include: {
            //         GoodsMaster: {
            //             include: { SkuMaster: { include: { mainSku: true } } },
            //         },
            //     },
            // },
            AssetMovement: { include: { AssetRegistration: true } },
            GeneralLedger: {
                include: {
                    ChartOfAccount: true,
                    AssetMovement: { include: { AssetRegistration: true } },
                },
            },
            remark: true,
        },
    })
}
