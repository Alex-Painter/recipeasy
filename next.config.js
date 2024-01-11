/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "/a*/**",
      },
      {
        protocol: "https",
        hostname: "d2zqrudgqssn0v.cloudfront.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.producthunt.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      // https://webpack.js.org/configuration/other-options/#ignorewarnings
      {
        module: /node-fetch/,
        message: /.*Can't resolve 'encoding'.*/,
      },
    ];

    return config;
  },
};

module.exports = nextConfig;
