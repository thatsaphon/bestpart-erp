namespace NodeJS {
    interface ProcessEnv {
        BCRYPT_SALT: number
        JWT_SECRET: string
        DATABASE_URL: string
        NEXT_PUBLIC_S3_API: string
        NEXT_PUBLIC_S3_SECRET_KEY_ID: string
        NEXT_PUBLIC_S3_SECRET_ACCESS_KEY: string
        NEXT_PUBLIC_BUCKET_NAME: string
        NEXT_PUBLIC_S3_PUBLIC_URL: string
    }
}
