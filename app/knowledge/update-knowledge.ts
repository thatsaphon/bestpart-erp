'use server'

import { revalidatePath } from 'next/cache'
import prisma from '../db/db'

export const updateKnowledge = async (id: number, content: string) => {
    await prisma.knowledge.update({
        where: {
            id,
        },
        data: {
            content,
        },
    })
    revalidatePath(`/knowledge`)
}
