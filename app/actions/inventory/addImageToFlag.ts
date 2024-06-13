'use server'

import prisma from '@/app/db/db'
import { uploadFile } from '@/lib/s3-client'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

export const addImageToTag = async (formData: FormData, fileName: string) => {
    const file = formData.get('file')
    const skuMasterId = Number(formData.get('skuMasterId'))
    const mainSkuId = Number(formData.get('mainSkuId'))

    if (skuMasterId) {
        await prisma.skuMaster.update({
            where: { id: skuMasterId },
            data: {
                Image: {
                    create: {
                        path: `${process.env.S3_PUBLIC_URL}/sku%${fileName}`,
                    },
                },
            },
        })
    }
}
