import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1) ESLint 오류 무시
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 2) TypeScript 검사 오류 무시
  typescript: {
    ignoreBuildErrors: true,
  },
  /* 기존 config 옵션들 */
};

export default nextConfig;