'use server'

import { revalidatePath } from 'next/cache'
import prisma from '../db/db'

export const addNewKnowledge = async (data: FormData) => {
    const content = data.get('content')

    if (typeof content !== 'string' || !content) throw new Error('')

    await prisma.knowledge.create({
        data: {
            content,
        },
    })

    revalidatePath('/knowledge')
}
