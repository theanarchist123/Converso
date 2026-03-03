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
  },
  webpack: (config) => {
    // Suppress the specific "Failed to get source map" error for @daily-co 
    // which Vapi uses internally and causes Invalid URL syntax in Webpack
    config.ignoreWarnings = [
      function ignoreSourcemapsloaderWarnings(warning: any) {
        return (
          warning.module &&
          warning.module.resource &&
          warning.module.resource.includes('@daily-co')
        );
      },
      /Failed to parse source map/,
    ];
    return config;
  }
};

export default nextConfig;
