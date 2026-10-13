import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite に「JSX を React 用に変換せよ」と教える。
export default defineConfig({
  plugins: [react()],
});
