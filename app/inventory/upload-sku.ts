'use server'

import { uploadFile } from '@/lib/s3-client'
import { NextResponse } from 'next/server'
import { addImageToTag } from '../actions/inventory/addImageToFlag'
import { revalidatePath } from 'next/cache'


export const uploadSkuMasterImage = async (formData: FormData) => {
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string

    const uploadFileName =
        fileName + '-' + Date.now().toString() +
        file.name.split('.').pop()
    // Upload to S3
    const result = await uploadFile(uploadFileName, file, 'sku')

    if (result) {
        await addImageToTag(
            formData,
            uploadFileName
        )
    }

    revalidatePath('/inventory')
    // return NextResponse.json(result)
}
