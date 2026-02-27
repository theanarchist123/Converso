import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      { hostname: 'img.clerk.com' },
      { hostname: 'images.unsplash.com' },
    ]
  }
};

export default nextConfig;
