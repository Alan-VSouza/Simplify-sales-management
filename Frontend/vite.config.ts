import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from "node:path";

export default defineConfig({
  resolve:{
    alias:{
      "@assets": path.resolve(__dirname, './src/assets'),
      "@pages": path.resolve(__dirname, './src/pages'),
      "@components": path.resolve(__dirname, './src/components'),
      "@store": path.resolve(__dirname, './src/store'),
      "@reducers": path.resolve(__dirname, './src/reducers'),
    }
  },
  plugins: [react()],
})
