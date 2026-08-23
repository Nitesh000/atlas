import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@atlas/database", "@atlas/config", "@atlas/types", "@atlas/utils"],
};

export default nextConfig;
