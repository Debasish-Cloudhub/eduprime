/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://iscc-backend-production.up.railway.app/api/v1',
    NEXT_PUBLIC_APP_NAME: 'ISCC Digital',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://iscc-backend-production.up.railway.app/api/v1'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
