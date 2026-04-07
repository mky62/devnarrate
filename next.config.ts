import type { NextConfig } from "next";
import path from "node:path";

const tiptapAliases = {
  "@/components/tiptap-ui": path.resolve(__dirname, "packages/tiptap/components/tiptap-ui"),
  "@/components/tiptap-ui-primitive": path.resolve(__dirname, "packages/tiptap/components/tiptap-ui-primitive"),
  "@/components/tiptap-icons": path.resolve(__dirname, "packages/tiptap/components/tiptap-icons"),
  "@/components/tiptap-node": path.resolve(__dirname, "packages/tiptap/components/tiptap-node"),
  "@/components/tiptap-extension": path.resolve(__dirname, "packages/tiptap/components/tiptap-extension"),
  "@/components/tiptap-templates": path.resolve(__dirname, "packages/tiptap/components/tiptap-templates"),
} as const;

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      ...tiptapAliases,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      ...tiptapAliases,
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;
