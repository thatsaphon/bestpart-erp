'use server'

import prisma from '@/app/db/db'

export async function searchAccountReceivableById(id: number) {
    try {
        const data = await prisma.contact.findUnique({
            where: {
                id: Number(id),
            },
        })

        if (!data) {
            throw new Error('Data not found')
        }
        return data
    } catch (err) {
        if (err instanceof Error) throw err
        throw new Error('Something went wrong')
    }
}
