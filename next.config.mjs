/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Only hosts we actually load images from. This list was previously
    // `hostname: "**"`, which turned /_next/image into an open proxy: anyone
    // could ask our server to fetch an arbitrary URL on their behalf.
    // Storefront photos are local (/collections, /editorial) and admin uploads
    // arrive as data URLs, so nothing else needs to be here — add a host
    // deliberately if a new external image source is introduced.
    remotePatterns: [
      {
        // Customer profile photos in Supabase Storage.
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        // Google account avatars (used until a customer uploads their own).
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Defense in depth for the admin area (it is also gated server-side).
        source: "/admin/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        // Brand photography rarely changes — let repeat visitors skip re-downloading it.
        source: "/collections/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/editorial/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
