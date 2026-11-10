/* Build do front para o GitHub Pages (pasta docs/; o CI gera em client/dist com --outDir) e configuração dos testes (Vitest + jsdom) */
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
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
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
/* Fim de vite.config.js */
