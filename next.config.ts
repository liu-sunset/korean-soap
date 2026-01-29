import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Netlify 图片优化配置
  images: {
    unoptimized: true,
  },
  // 输出配置
  output: 'standalone',
};

export default nextConfig;
