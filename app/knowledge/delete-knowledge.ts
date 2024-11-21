'use server'

import { revalidatePath } from 'next/cache'
import prisma from '../db/db'

export const deleteKnowledge = async (id: number) => {
    await prisma.knowledge.delete({ where: { id } })
    revalidatePath('/knowledge')
}
