import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = "los-makileros";

const nextConfig: NextConfig = {
  // For GitHub Pages static export
  output: isGithubPages ? "export" : "standalone",
  // GitHub Pages serves from username.github.io/repo-name/
  basePath: isGithubPages ? `/${repoName}` : "",
  // Disable image optimization for static export
  images: { unoptimized: true },
  // TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
