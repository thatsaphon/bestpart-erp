namespace NodeJS {
    interface ProcessEnv {
        BCRYPT_SALT: number
        JWT_SECRET: string
        DATABASE_URL: string
        S3_API: string
        S3_SECRET_KEY_ID: string
        S3_SECRET_ACCESS_KEY: string
        BUCKET_NAME: string
        S3_PUBLIC_URL: string
    }
}
