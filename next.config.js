// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // React configuration
  reactStrictMode: true,
  
  // Experimental features
  experimental: {
    // Enable modern bundling optimizations
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  
  // Webpack configuration for audio files and other assets
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add support for audio files
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|m4a)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/audio/[name].[hash][ext]',
      },
    })
    
    // Add support for fonts
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[name].[hash][ext]',
      },
    })
    
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244000,
          },
          tanstackQuery: {
            test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
            name: 'tanstack-query',
            chunks: 'all',
            priority: 10,
          },
          recharts: {
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            name: 'recharts',
            chunks: 'all',
            priority: 10,
          },
        },
      }
    }
    
    // Add webpack plugins for production optimizations
    if (!dev && !isServer) {
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 50,
        })
      )
    }
    
    return config
  },
  
  // Environment variables that should be available to the browser
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // API routes configuration
  async rewrites() {
    return [
      // Proxy API calls to backend during development
      ...(process.env.NODE_ENV === 'development' ? [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
        },
      ] : []),
    ]
  },
  
  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
  
  // Output configuration for static exports if needed
  output: 'standalone',
  
  // TypeScript configuration
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors. Only use if you know what you're doing!
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib', 'hooks', 'stores', 'utils'],
  },
  
  // Logging configuration
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

export default nextConfig