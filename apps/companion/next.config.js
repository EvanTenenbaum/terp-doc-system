/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  env: {
    GUIDES_DIR: process.env.GUIDES_DIR || './guides',
  },
};

module.exports = nextConfig;
