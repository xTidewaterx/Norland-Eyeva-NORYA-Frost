/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com"], // ✅ Ensure Firebase domain is listed
  },
};

export default nextConfig;