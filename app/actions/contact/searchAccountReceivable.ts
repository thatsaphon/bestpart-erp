'use server'

import prisma from '@/app/db/db'

export async function searchAccountReceivable(
    value: string,
    page = '1',
    limit = '10'
) {
    try {
        return await prisma.contact.findMany({
            where: { name: { contains: value } },
            include: {
                Address: true,
            },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
        })
    } catch (err) {
        console.log(err)
        return []
    }
}
