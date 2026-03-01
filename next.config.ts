import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
    // Cloudinary images are already optimized via their CDN.
    // Skip Next.js image optimization for external URLs to avoid timeout errors.
    unoptimized: true,
  },
};

export default nextConfig;
