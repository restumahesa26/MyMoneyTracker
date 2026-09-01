import { execSync } from "node:child_process";

let lastUpdated = "";
let commitHash = "";

try {
  lastUpdated = execSync('git log -1 --format="%cI"', { encoding: "utf-8" }).trim();
  commitHash = execSync('git log -1 --format="%h"', { encoding: "utf-8" }).trim();
} catch (e) {
  lastUpdated = new Date().toISOString();
}

if (!lastUpdated) {
  lastUpdated = new Date().toISOString();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_LAST_UPDATED: lastUpdated,
    NEXT_PUBLIC_APP_COMMIT_HASH: commitHash,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', 'date-fns'],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

