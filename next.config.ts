import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import path from "node:path";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd()),
};

export default withPWA(nextConfig);
