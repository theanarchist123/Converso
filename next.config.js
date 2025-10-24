/** @type {import('next').NextConfig} */
const nextConfig = {
  // Commented out for simpler Docker build
  // output: 'standalone',
  
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      { hostname: 'img.clerk.com' }
    ]
  }
};

module.exports = nextConfig;
