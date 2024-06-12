'use server'

import prisma from '@/app/db/db'
import { revalidatePath } from 'next/cache'

export const upsertMainSkuRemark = async (remark: string, mainSkuId: number | undefined) => {
    await prisma.mainSkuRemark.upsert({
        update: {
            name: remark,
            MainSku: {
                connect: {
                    id: mainSkuId
                }
            }
        },
        create: {
            name: remark,
            MainSku: {
                connect: {
                    id: mainSkuId
                }
            }
        },
        where: {
            name: remark,
        }
    })

    revalidatePath('/inventory')
}

export const disconnectMainSkuRemark = async (remarkId: number, mainSkuId: number) => {
    await prisma.mainSkuRemark.update({
        where: { id: remarkId },
        data: {
            MainSku: {
                disconnect: {
                    id: mainSkuId
                }
            }
        }
    })

    revalidatePath('/inventory')
}