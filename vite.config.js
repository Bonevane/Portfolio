import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    rollupOptions: {
      output: {
        // Function form so subpath imports (react/jsx-runtime, three/examples)
        // land in the right chunk; the object form let jsx-runtime fall into
        // three-vendor, which dragged 1.2 MB of three.js onto the Home page.
        manualChunks(id) {
          // Vite's preload helper is shared by every chunk; keep it with React.
          if (id.includes("vite/preload-helper")) return "react-vendor";
          if (!id.includes("node_modules")) return;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react-vendor";
          if (/[\\/]node_modules[\\/](three|@react-three|@react-spring)[\\/]/.test(id)) return "three-vendor";
          if (/[\\/]node_modules[\\/](gsap|ogl)[\\/]/.test(id)) return "animation-vendor";
        },
      },
    },
  },
});
