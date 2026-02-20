import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      include: ["path"],
      exclude: ["http"],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      overrides: {
        fs: "memfs",
      },
      protocolImports: true,
    }),
    react({
      jsxRuntime: 'automatic',
      exclude: /node_modules\/.*(?<!\.test\.)[jt]sx?$/,
    }),
    {
      name: 'public-url-imports',
      resolveId(source) {
        if (source.startsWith('/images/') || 
            source.startsWith('/public/') ||
            source.includes('/images/dist/') ||
            source.includes('/public/images/')) {
          return `\0${source}`;
        }
        return null;
      },
      load(id) {
        if (id.startsWith('\0')) {
          const path = id.slice(1);
          let publicPath = path;
          
          const imagesMatch = path.match(/(?:.*?)(\/images\/.*)/);
          const publicMatch = path.match(/(?:.*?)(\/public\/.*)/);
          
          if (imagesMatch) {
            publicPath = imagesMatch[1];
          } else if (publicMatch) {
            publicPath = publicMatch[1];
          }
          
          return `export default ${JSON.stringify(publicPath)};`;
        }
        return null;
      }
    }
  ],
  build: {
    target: "es2022",
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
      strictRequires: true,
      transformMixedEsModules: true,
      // Добавляем специальную обработку для проблемных пакетов
      defaultIsModuleExports: true,
      requireReturnsDefault: 'auto',
    },
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined,
        // Добавляем обработку для commonjs
        interop: 'auto',
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      '@keplr-wallet/cosmos',
      '@chain-registry/keplr',
    ],
    esbuildOptions: {
      target: 'es2022',
      // Добавляем глобальные переменные
      define: {
        global: 'globalThis',
      },
    },
  },
resolve: {
  alias: {
    '@keplr-wallet/cosmos': '@keplr-wallet/cosmos/build/index.js', // keep if needed
    '@keplr-wallet/cosmos/build/index.js': '@keplr-wallet/cosmos/build/bech32/index.js', // override the barrel
  },
},
  // Добавляем глобальные переменные
  define: {
    global: 'globalThis',
  },
});
