'use server'

import prisma from '@/app/db/db'
import { revalidatePath } from 'next/cache'

export const upsertSkuMasterRemark = async (remark: string, skuMasterId: number | undefined) => {
    await prisma.skuMasterRemark.upsert({
        update: {
            name: remark,
            SkuMaster: {
                connect: {
                    id: skuMasterId
                }
            }
        },
        create: {
            name: remark,
            SkuMaster: {
                connect: {
                    id: skuMasterId
                }
            }
        },
        where: {
            name: remark,
        }
    })

    revalidatePath('/inventory')
}

export const disconnectSkuMasterRemark = async (remarkId: number, skuMasterId: number) => {
    await prisma.skuMasterRemark.update({
        where: { id: remarkId },
        data: {
            SkuMaster: {
                disconnect: {
                    id: skuMasterId
                }
            }
        }
    })

    revalidatePath('/inventory')
}