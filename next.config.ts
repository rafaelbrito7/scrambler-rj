import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The PDF renderer brings its own reconciler and must not be bundled with the server code.
  serverExternalPackages: ["@react-pdf/renderer"],
  experimental: {
    // Opening a batch uploads up to eight 5 MB photos in one form.
    serverActions: { bodySizeLimit: "45mb" },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
};

export default nextConfig;
