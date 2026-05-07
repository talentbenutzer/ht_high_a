/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow large video files during build
  experimental: {
    largePageDataBytes: 128 * 1000,
  },
}

module.exports = nextConfig
