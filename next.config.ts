import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Inline the small global CSS so nothing render-blocks the hero images.
  experimental: { inlineCss: true },
  // Phones get a 640 or 900px image; larger widths only for tablets and desktops.
  // AVIF first (negotiated per browser via Accept), WebP otherwise.
  images: { deviceSizes: [640, 900, 1200, 1600, 1920, 2560], formats: ["image/avif", "image/webp"] },
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
