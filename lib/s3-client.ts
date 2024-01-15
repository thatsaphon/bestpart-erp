import { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"

const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.NEXT_PUBLIC_S3_API, // Cloudflare R2 endpoint URL
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_SECRET_KEY_ID,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
    },
})


export const uploadFile = async (bucketName: string, fileName: string, fileContent: File, path?: string | undefined) => {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: path ? `${path}/${fileName}` : `${fileName}`,
        Body: fileContent,
    })
    try {
        const { ETag } = await s3.send(command)
        console.log(`File ${fileName} uploaded with ETag ${ETag}`)
    } catch (error) {
        console.log(error)
        console.error(`Error uploading file ${fileName} to bucket ${bucketName}`, error)
    }
}

export const getPublicFile = async (bucketName: string, fileName: string) => {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileName,
    })
}