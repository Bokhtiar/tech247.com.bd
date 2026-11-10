const DEFAULT_API_BASE_URL = "https://api.tech247.com.bd/api";
const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "");
const mediaOrigin = apiBaseUrl.replace(/\/api$/i, "");

function mediaRemotePatterns(origin) {
  try {
    const url = new URL(origin);
    const port = url.port || undefined;
    return [
      { protocol: url.protocol.replace(":", ""), hostname: url.hostname, ...(port ? { port } : {}), pathname: "/images/**" },
      { protocol: url.protocol.replace(":", ""), hostname: url.hostname, ...(port ? { port } : {}), pathname: "/storage/**" },
    ];
  } catch {
    return [];
  }
}

const nextConfig = {
  env: {
    API_BASE_URL: apiBaseUrl,
    NEXT_PUBLIC_API_BASE_URL: apiBaseUrl,
  },
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      ...mediaRemotePatterns(mediaOrigin),
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/images/**" },
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/storage/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/images/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/storage/**" },
      { protocol: "https", hostname: "api.tech247.com.bd", pathname: "/images/**" },
      { protocol: "https", hostname: "api.tech247.com.bd", pathname: "/storage/**" },
      { protocol: "http", hostname: "api.tech247.com.bd", pathname: "/images/**" },
      { protocol: "http", hostname: "api.tech247.com.bd", pathname: "/storage/**" },
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
