'use server'

import {
    S3Client,
    ListBucketsCommand,
    PutObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3'

const s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.S3_API, // Cloudflare R2 endpoint URL
    credentials: {
        accessKeyId: process.env.S3_SECRET_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
})

export const uploadFile = async (
    bucket: string,
    fileName: string,
    fileContent: File,
    path?: string | undefined
) => {
    // Convert file to buffer before uploading
    const fileBuffer = await fileContent.arrayBuffer()
    const fileContentBuffer = Buffer.from(fileBuffer)
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: path ? `${path}/${fileName}` : `${fileName}`,
        Body: fileContentBuffer,
    })
    try {
        const { ETag } = await s3.send(command)
        console.log(`File ${fileName} uploaded with ETag ${ETag}`)
        return ETag
    } catch (error) {
        console.log(error)
        console.error(
            `Error uploading file ${fileName} to bucket ${process.env.BUCKET_NAME}`,
            error
        )
    }
}
