'use server'

import prisma from '@/app/db/db'

export const getContactDetail = async (id: string) => {
    return await prisma.contact.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            Address: true,
            ArSubledger: {
                include: {
                    Document: {
                        include: {
                            GeneralLedger: {
                                where: { chartOfAccountId: 12000 },
                            },
                        },
                    },
                },
            },
            ApSubledger: {
                include: {
                    Document: {
                        include: {
                            GeneralLedger: {
                                where: { chartOfAccountId: 21000 },
                            },
                        },
                    },
                },
            },
        },
    })
}
