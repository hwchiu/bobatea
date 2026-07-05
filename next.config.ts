import type { NextConfig } from "next";

// basePath 由部署環境決定（預設 /bobatea）；設 NEXT_PUBLIC_BASE_PATH="" 可部署在根路徑
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/bobatea";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
};

export default nextConfig;
