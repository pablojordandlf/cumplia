import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para Vercel - Updated March 2026
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
