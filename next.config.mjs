/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/i,
      use: [
        {
          loader: "file-loader",
          options: {
            publicPath: "/_next/static/sounds",
            outputPath: "static/sounds",
            name: "[name].[hash].[ext]",
            esModule: false,
          },
        },
      ],
    });
    return config;
  },
};

export default nextConfig;
