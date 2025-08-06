import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators:false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizeCss: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "raw.githubusercontent.com",
      },
      {
        hostname: "images.unsplash.com",
      },
      {
        hostname: "d2c9u2e33z36pz.cloudfront.net",
      }

    ],
  },
}
export default nextConfig
