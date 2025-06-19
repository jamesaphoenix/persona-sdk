/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@jamesaphoenix/persona-sdk'],
  webpack: (config, { isServer }) => {
    // Only apply these for client-side bundles
    if (!isServer) {
      // Ignore server-side modules in browser bundles
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        util: false,
        url: false,
        querystring: false,
        buffer: false,
        events: false,
        assert: false,
        async_hooks: false,
        diagnostics_channel: false,
      };

      // Ignore tiktoken WASM in browser builds
      config.module.rules.push({
        test: /tiktoken_bg\.wasm$/,
        type: 'javascript/auto',
        loader: 'ignore-loader'
      });

      // Configure experiments for WebAssembly
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };
    }

    return config;
  },
}

export default nextConfig