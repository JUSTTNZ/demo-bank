import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bptmlpuyxhcwjzwfbctt.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
