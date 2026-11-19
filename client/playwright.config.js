/* Teste de ponta a ponta no navegador: build do front (vite preview) e a API com PostgreSQL real
   (E2E_DATABASE_URL) e leitura da IA simulada. Portas próprias para não colidir com outros servidores. */
import { defineConfig } from '@playwright/test';

const API_PORT = 3117;
const WEB_PORT = 4317;
export const TOKEN = process.env.E2E_API_TOKEN || 'e2e-token-de-teste-com-32-caracteres';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: { baseURL: `http://localhost:${WEB_PORT}` },
  /* Desktop (1280 px) e celular (375 x 812, #42). No celular, as animações ficam ligadas: neutralizar antes de medir
     a largura esconderia a rolagem lateral. Sem isMobile, para a janela não se alargar até caber o conteúdo. */
  projects: [
    { name: 'desktop', use: { reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } } },
    { name: 'celular', use: { reducedMotion: 'no-preference', viewport: { width: 375, height: 812 } } },
  ],
  webServer: [
    {
      command: 'node ../server/scripts/servidor-e2e.js',
      url: `http://localhost:${API_PORT}/health`,
      env: { PORT: String(API_PORT), API_TOKEN: TOKEN, CORS_ORIGINS: `http://localhost:${WEB_PORT}`, E2E_DATABASE_URL: process.env.E2E_DATABASE_URL || '' },
      timeout: 60_000,
    },
    {
      command: `npx vite build --outDir dist --emptyOutDir && npx vite preview --outDir dist --port ${WEB_PORT} --strictPort`,
      url: `http://localhost:${WEB_PORT}/controle-financas/`,
      env: { VITE_API_URL: `http://localhost:${API_PORT}/api` },
      timeout: 180_000,
    },
  ],
});
/* Fim de playwright.config.js */
