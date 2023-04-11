import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import dotenv from "dotenv";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  console.log("=== env ===", mode, JSON.stringify(env));

  // const VITE_PROXY = "http://localhost:8095"

  return {
    env: env,
    plugins: [vue()],
    server: {
      host: true,
      port: 5173,
      proxy: {
        "/api": { target: env.VITE_PROXY, secure: false, changeOrigin: true },
        "/cas": { target: env.VITE_PROXY, secure: false },
        "/default": { target: env.VITE_PROXY, secure: false },
        "/user": { target: env.VITE_PROXY, secure: false },
        "/admin": { target: env.VITE_PROXY, secure: false },
        "/static": { target: env.VITE_PROXY, secure: false },
      },
    },
    devServer: {
      host: true,
      port: 5173,
      proxy: {
        "/api": { target: env.VITE_PROXY, secure: false, changeOrigin: true },
        "/cas": { target: env.VITE_PROXY, secure: false },
        "/default": { target: env.VITE_PROXY, secure: false },
        "/user": { target: env.VITE_PROXY, secure: false },
        "/admin": { target: env.VITE_PROXY, secure: false },
        "/static": { target: env.VITE_PROXY, secure: false },
      },
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    //@ts-ignore
    test: {
      globals: true,
      environment: "jsdom",
    },
  };
});
