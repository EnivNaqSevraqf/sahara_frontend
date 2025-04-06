import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: true,
  }
  /* config options here */
};

export default nextConfig;
