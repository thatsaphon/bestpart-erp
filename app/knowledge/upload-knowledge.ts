'use server'

import { uploadFile } from '@/lib/s3-client'
import { NextResponse } from 'next/server'
import { addImageToTag } from '../actions/inventory/addImageToFlag'
import { revalidatePath } from 'next/cache'
import prisma from '../db/db'

export const uploadKnowledgeImage = async (id: number, formData: FormData) => {
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string

    if (file.size === 0) throw new Error('File not found')

    const uploadFileName =
        fileName +
        '-' +
        Date.now().toString() +
        '.' +
        file.name.split('.').pop()
    // Upload to S3
    const result = await uploadFile(uploadFileName, file, 'knowledge-image')

    if (result) {
        // await addImageToTag(formData, uploadFileName)
        await prisma.knowledgeImage.create({
            data: {
                path: `${process.env.S3_PUBLIC_URL}/knowledge-image/${uploadFileName}`,
                knowledgeId: id,
            },
        })
    }

    revalidatePath('/knowledge')
}
