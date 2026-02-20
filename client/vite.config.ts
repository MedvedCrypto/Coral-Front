import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from 'path';

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
    react(),
    {
      name: 'public-url-imports',
      resolveId(source) {
        // Обрабатываем разные типы путей к public
        if (source.startsWith('/images/') || 
            source.startsWith('/public/') ||
            source.includes('/images/dist/') ||  // относительные пути с images/dist
            source.includes('/public/images/')) {
          return `\0${source}`;
        }
        return null;
      },
      load(id) {
        if (id.startsWith('\0')) {
          const path = id.slice(1); // убираем нулевой байт
          // Экспортируем строку с путём как значение по умолчанию
          // Извлекаем только часть после /images/ или /public/
          let publicPath = path;
          
          // Пытаемся найти путь относительно public
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
    target: "es2022"
  }
});
