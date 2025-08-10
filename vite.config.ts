import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: '/', // 모든 에셋의 기본 경로를 루트로 설정
  plugins: [react({ jsxRuntime: 'automatic' }), tailwindcss()],
  assetsInclude: ["**/*.html"], // HTML 파일을 에셋으로 명시적으로 포함
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
