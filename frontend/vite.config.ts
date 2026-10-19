import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ブラウザからの /api/... を裏側（3000）へ転送する。
      // 画面側のコードは裏側のアドレスを知らなくてよい。
      "/api": "http://localhost:3000",
    },
  },
});