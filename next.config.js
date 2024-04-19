/** @type {import('next').NextConfig} */

const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin')
const path = require('path')

const nextConfig = {
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.plugins = [...config.plugins, new PrismaPlugin()]
        }

        return config
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        outputFileTracingIncludes: {
            '/': ['./master-data/**/*'],
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'pub-17b2cad0ae3348438b651532c931ecb6.r2.dev',
            },
        ],
    },
}

module.exports = nextConfig
