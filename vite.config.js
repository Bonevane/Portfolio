import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React and core libraries
          "react-vendor": ["react", "react-dom"],

          // Three.js and 3D-related libraries (heavy!)
          "three-vendor": [
            "three",
            "@react-three/fiber",
            "@react-three/drei",
            "@react-spring/three",
          ],

          // Animation and graphics
          "animation-vendor": ["gsap", "ogl"],

          // Utilities
          "utils-vendor": ["clsx"],
        },
      },
    },
  },
});
