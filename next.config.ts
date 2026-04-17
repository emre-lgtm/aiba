import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.bigmodel.cn",
      },
      {
        protocol: "https",
        hostname: "sfile.chatglm.cn",
      },
    ],
  },
};

export default nextConfig;
