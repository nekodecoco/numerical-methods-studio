/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure transpilePackages if needed for Plotly or mathjs
  transpilePackages: ['react-plotly.js'],
};

export default nextConfig;
