/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/**
 * Vercel-friendly config (SSR/CSR).
 * - Removed `output: "export"` because Vercel deploys Next.js natively.
 * - PWA works via next-pwa (service worker in /public).
 */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ["res.cloudinary.com"],
  },
};

module.exports = withPWA(nextConfig);
