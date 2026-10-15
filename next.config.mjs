const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/images/**" },
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/storage/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/images/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/storage/**" },
      { protocol: "http", hostname: "admin.tech247.com.bd", pathname: "/images/**" },
      { protocol: "http", hostname: "admin.tech247.com.bd", pathname: "/storage/**" },
      { protocol: "https", hostname: "admin.tech247.com.bd", pathname: "/images/**" },
      { protocol: "https", hostname: "admin.tech247.com.bd", pathname: "/storage/**" },
    ],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
