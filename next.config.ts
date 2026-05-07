import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  // For project pages this would need basePath/assetPrefix.
  // Domain is root (joshuaboermans.com), so keep it clean.
  basePath: '',
  assetPrefix: isProd ? '' : undefined,
  trailingSlash: true
};

export default nextConfig;
