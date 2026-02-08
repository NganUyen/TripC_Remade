/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // Increase timeout for image optimization to prevent timeout errors
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
  },
  webpack: (config, { isServer }) => {
    // Exclude server-only packages from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "firebase-admin": false,
        "firebase-admin/app": false,
        "firebase-admin/auth": false,
        "firebase-admin/firestore": false,
        "firebase-admin/messaging": false,
      };
    }
    // Also exclude from server bundle to prevent any bundling
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push("firebase-admin");
    }
    return config;
  },
};

// Temporarily disabled PWA due to module issues
// const withPWA = require('next-pwa')({
//   dest: 'public',
//   disable: process.env.NODE_ENV === 'development',
// });

// module.exports = withPWA(nextConfig);
module.exports = nextConfig;
