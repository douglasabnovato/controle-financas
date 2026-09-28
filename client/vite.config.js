/* Build do front para o GitHub Pages (pasta docs/) e configuração dos testes (Vitest + jsdom) */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/controle-financas/',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    globals: false,
  },
})
/* Fim de vite.config.js */
