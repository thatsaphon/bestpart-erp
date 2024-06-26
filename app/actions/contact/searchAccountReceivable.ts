'use server'

import prisma from '@/app/db/db'

export async function searchAccountReceivable(
    value: string,
    page = 1,
    limit = 10
) {
    try {
        return await prisma.contact.findMany({
            where: {
                OR: [
                    {
                        AND: value
                            .split(' ')
                            .map((x) => ({ name: { contains: x } })),
                    },

                    {
                        AND: value
                            .split(' ')
                            .map((x) => ({ address: { contains: x } })),
                    },
                    {
                        AND: value
                            .split(' ')
                            .map((x) => ({ phone: { contains: x } })),
                    },
                    {
                        AND: value
                            .split(' ')
                            .map((x) => ({ taxId: { contains: x } })),
                    },
                    {
                        AND: value
                            .split(' ')
                            .map((x) => ({ searchKeyword: { contains: x } })),
                    },
                ],
                isAr: true,
            },
            skip: (page - 1) * limit,
            take: limit,
        })
    } catch (err) {
        console.log(err)
        return []
    }
}
