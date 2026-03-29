import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore (Bypass strict typescript definition catchup in Next 15+ for experimental dev servers)
  allowedDevOrigins: ['192.168.1.11', 'localhost'],
};

export default nextConfig;
