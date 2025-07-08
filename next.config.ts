import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 빌드 시 ESLint 오류를 무시하도록 설정
  eslint: {
    ignoreDuringBuilds: true,
  },

  /* 기존 config 옵션들 */
};

export default nextConfig;