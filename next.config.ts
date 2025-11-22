import type { NextConfig } from "next";

// honestly I used ChatGPT for this

const ffExtNames = ["ffmpeg-static", "ffprobe-static"];

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // make originals into an array so we don't clobber other externals config
      const originalExternals = config.externals;
      const externalsArray: any[] =
        originalExternals == null
          ? []
          : Array.isArray(originalExternals)
          ? [...originalExternals]
          : [originalExternals];

      // Prepend our small externals function that only intercepts the ff* packages.
      // Use the new shape: ({ context, request }, callback) => { ... }
      externalsArray.unshift(function externalsFfProbe(
        { request }: any,
        callback: any
      ) {
        if (typeof request === "string" && ffExtNames.includes(request)) {
          // leave the require('ffprobe-static') as-is at runtime (commonjs)
          return callback(null, `commonjs ${request}`);
        }
        // let webpack handle other requests (next item in the externals array will be tried)
        return callback();
      });

      // set the config.externals to the new array
      config.externals = externalsArray;
    }

    return config;
  },
  images: {
    remotePatterns: [new URL("https://assets.epicdle.com/**")],
  },
  async headers() {
    return [
      {
        source: "/:path*.gif",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/:path*.webp",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/:path*.webm",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/:path*.opus",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
};

export default nextConfig;
