/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  // Suppress hydration warnings in development
  reactStrictMode: true,
  // Optimize for better hydration
  swcMinify: true,
  // Remove experimental optimizeCss that requires critters
  experimental: {
    // optimizeCss: true, // Removed this line
  },
  // Webpack configuration for better client-server consistency
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;