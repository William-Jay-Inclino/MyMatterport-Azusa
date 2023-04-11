import { defineConfig } from "cypress";

const VITE_PROXY = "http://localhost:8095";
import viteConfig from "./vite.config";


export default defineConfig({
  // chromeWebSecurity: false,

  // e2e: {
  //   specPattern: "cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}",
  //   baseUrl: "http://localhost:4173",
  // },
  // viewportWidth: 1560,
  // viewportHeight: 850,

  e2e: {
    specPattern: "cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:5173",
  },

  viewportWidth: 1560,
  viewportHeight: 850,
  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
      viteConfig: {
        server: {
          host: true,
          port: 5173,
          proxy: {
            "/api": { target: VITE_PROXY, secure: false, changeOrigin: true },
            "/cas": { target: VITE_PROXY, secure: false },
            "/default": { target: VITE_PROXY, secure: false },
            "/user": { target: VITE_PROXY, secure: false },
            "/admin": { target: VITE_PROXY, secure: false },
            "/static": { target: VITE_PROXY, secure: false },
          },
        },

        // ... other overrides ...
      },
    },
  },
});
