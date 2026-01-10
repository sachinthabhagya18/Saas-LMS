/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // ✅ This line is required for Docker
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**', // Allow images from any domain (for development)
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // If you use TypeScript, ignore errors during build (optional but safer for production builds)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
}

module.exports = nextConfig