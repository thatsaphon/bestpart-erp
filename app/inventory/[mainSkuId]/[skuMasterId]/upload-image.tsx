'use client'

import DragDropUpload from '@/components/drag-and-drop-upload'
import React from 'react'
import { uploadSkuMasterImage } from '../../upload-sku'
import { uploadFile } from '@/lib/s3-client'
import { uploadMultiple } from './upload-multiple'
import toast from 'react-hot-toast'

type Props = {
    skuMasterId: number
    fileName: string
}

export default function UploadImage({ skuMasterId, fileName }: Props) {
    return (
        <DragDropUpload
            submitFunction={async (formData) => {
                try {
                    formData.append('fileName', fileName)
                    formData.append('skuMasterId', String(skuMasterId))
                    await uploadSkuMasterImage(formData)
                    toast.success('upload successfully')
                } catch (err) {
                    if (err instanceof Error) {
                        toast.error(err.message)
                        return
                    }
                    toast.error('Somethings went wrong')
                }
                // await uploadMultiple(skuMasterId, formData, fileName)
            }}
        />
    )
}
