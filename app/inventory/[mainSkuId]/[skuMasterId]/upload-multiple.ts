'use server'

import { addImageToTag } from '@/app/actions/inventory/addImageToFlag'
import prisma from '@/app/db/db'
import { uploadFile } from '@/lib/s3-client'
import { revalidatePath } from 'next/cache'

export const uploadMultiple = async (
    skuMasterId: number,
    stringFiles: string,
    fileName: string
) => {
    const files = JSON.parse(stringFiles) as File[]
    console.log(files)
    const promises = files.map(async (file, index) => {
        const uploadFileName = fileName + '-' + Date.now().toString() + index
        const result = await uploadFile(
            process.env.BUCKET_NAME,
            uploadFileName,
            file,
            'sku'
        )
        console.log(result)
        if (result) {
            await prisma.skuMaster.update({
                where: { id: skuMasterId },
                data: {
                    Image: {
                        createMany: {
                            data: files.map((file, index) => ({
                                path: `${process.env.S3_PUBLIC_URL}/sku/${fileName}-${index}${file.name.split('.').pop()}`,
                            })),
                        },
                    },
                },
            })
        }
    })

    await Promise.all(promises)
}
