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
    outputFileTracingRoot: path.join(__dirname, '../../'),
    outputFileTracingIncludes: {
      '/': ['./master-data/*', './master-data/**/*'],
    },
  },
}

module.exports = nextConfig
