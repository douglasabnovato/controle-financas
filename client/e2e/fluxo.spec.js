/* Fluxo principal no navegador, com a API real: configurar o acesso, enviar a foto de um cupom,
   ver no catálogo, abrir o detalhe pelo teclado, avaliar a leitura e fechar com Esc. axe com contraste em cada tela. */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { TOKEN } from '../playwright.config.js';

/* PNG de 1 x 1 pixel: a leitura da IA é simulada na API de teste */
const PNG = Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010806000000' + '1f15c4890000000d49444154789c63f8ffff3f0005fe02fea7d6a4c50000000049454e44ae426082', 'hex');

/* axe sem violações (inclui contraste, que o jsdom não mede) */
async function semViolacoes(page, seletor) {
  const builder = new AxeBuilder({ page });
  if (seletor) builder.include(seletor);
  const { violations } = await builder.analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

test('configura o acesso, envia um cupom, abre o detalhe pelo teclado e avalia a leitura', async ({ page }) => {
  const sufixo = Date.now();
  await page.goto('/controle-financas/');
  await expect(page.getByRole('heading', { name: 'Configurar acesso' })).toBeVisible();
  await semViolacoes(page);

  /* Dados fictícios: nenhum dado pessoal real */
  await page.getByLabel('Token de acesso da API').fill(TOKEN);
  await page.getByLabel('Nome completo').fill('Pessoa de Teste');
  await page.getByLabel('E-mail').fill(`teste-${sufixo}@example.com`);
  await page.getByLabel('Apelido').fill('Teste');
  await page.getByLabel('WhatsApp (DDD + número)').fill('11900000000');
  await page.getByLabel('WhatsApp (DDD + número)').press('Enter');

  await expect(page.getByRole('heading', { name: 'Enviar novo cupom fiscal' })).toBeVisible();
  await expect(page.getByText('Nenhum cupom cadastrado ainda.')).toBeVisible();
  await semViolacoes(page);

  await page.getByLabel(/Foto do cupom/).setInputFiles({ name: 'cupom.png', mimeType: 'image/png', buffer: PNG });
  await page.getByRole('button', { name: 'Enviar e processar cupom' }).click();
  await expect(page.getByRole('status').filter({ hasText: /Cupom .* salvo: Mercado Exemplo/ })).toBeVisible();

  const detalhes = page.getByRole('button', { name: /Detalhes do cupom/ }).first();
  await expect(detalhes).toBeVisible();
  await detalhes.focus();
  await page.keyboard.press('Enter');

  const dialogo = page.getByRole('dialog');
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByText('Pão francês')).toBeVisible();
  await semViolacoes(page, '[role="dialog"]');

  await dialogo.getByRole('button', { name: 'Sim, sem correção' }).click();
  await expect(dialogo.getByText('Leitura aceita.')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialogo).toBeHidden();
  await expect(detalhes).toBeFocused();
});
/* Fim de fluxo.spec.js */
