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
      // Явно указываем использовать новый JSX трансформатор
      jsxRuntime: 'automatic',
      // Исключаем определенные модули из обработки
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
    // Добавляем настройки для CommonJS
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
      strictRequires: true,
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // Явно указываем внешние зависимости для React
      external: [],
      output: {
        manualChunks: undefined,
      },
    },
  },
  // Оптимизация зависимостей
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
    ],
    esbuildOptions: {
      target: 'es2022',
    },
  },
  // Разрешение модулей
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
});
