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
    react(),
    {
      name: 'public-url-imports',
      resolveId(source) {
        // Перехватываем импорты, начинающиеся с /images/ или /public/
        if (source.startsWith('/images/') || source.startsWith('/public/' || source.startsWith('../images/' || source.startsWith('../../images/')) {
          return `\0${source}`; // виртуальный модуль
        }
        return null;
      },
      load(id) {
        if (id.startsWith('\0/images/') || id.startsWith('\0/public/')) {
          const path = id.slice(1); // убираем нулевой байт
          // Экспортируем строку с путём как значение по умолчанию
          return `export default ${JSON.stringify(path)};`;
        }
        return null;
      }
    }
  ],
});
