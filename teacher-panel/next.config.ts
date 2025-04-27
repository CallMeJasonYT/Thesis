import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },

  // Add redirects for route protection
  async redirects() {
    return [
      {
        source: "/Stats",
        destination: "/",
        permanent: false,
      },
      {
        source: "/Inspect",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
