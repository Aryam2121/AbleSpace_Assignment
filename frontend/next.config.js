/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.worldofbooks.com', 'via.placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.worldofbooks.com',
      },
    ],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
