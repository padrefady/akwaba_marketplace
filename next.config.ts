import type { NextConfig } from "next";

const langPattern = 'fr|en|es|ar|zh|de|pt|pi|ful|ewo|bam|med|gho|dua|bas|bak|bmn|maf|mof|kap|tik|kom';

const nextConfig: NextConfig = {
 
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async rewrites() {
    return [
      // Language prefix only: /en → /
      {
        source: `/:lang(${langPattern})`,
        destination: '/',
      },
      // Language prefix + nested path: /en/anything → /anything
      {
        source: `/:lang(${langPattern})/:path*`,
        destination: '/:path*',
      },
    ];
  },
};

export default nextConfig;
