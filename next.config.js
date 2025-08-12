/** @type {import('next').NextConfig} */
const nextConfig = {
  // Completely disable SWC
  swcMinify: false,
  experimental: {
    forceSwcTransforms: false,
    esmExternals: false,
  },
  compiler: {
    // Disable SWC completely
    swcLoader: false,
  },
  // Force Babel usage
  webpack: (config, { dev, isServer }) => {
    // Replace SWC with Babel for all JS/TS files
    config.module.rules = config.module.rules.map((rule) => {
      if (rule.test && rule.test.toString().includes('tsx')) {
        return {
          ...rule,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['next/babel'],
              cacheDirectory: true,
            },
          },
        }
      }
      return rule
    })
    
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    return config
  },
}

module.exports = nextConfig