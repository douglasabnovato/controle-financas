/* Fluxo principal no navegador, com a API real, só pelo teclado: configurar o acesso, enviar a foto de um cupom,
   ver no catálogo, abrir o detalhe, avaliar ou corrigir a leitura (#29) e fechar com Esc. axe com contraste em cada tela.
   Sem .focus() nem fill(): o foco anda com Tab e o texto entra com keyboard.type. A única exceção é o arquivo:
   o Espaço abre o seletor, e o Playwright escolhe o arquivo, porque o seletor do sistema não é controlável. */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { TOKEN } from '../playwright.config.js';

/* PNG de 1 x 1 pixel: a leitura da IA é simulada na API de teste */
const PNG = Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010806000000' + '1f15c4890000000d49444154789c63f8ffff3f0005fe02fea7d6a4c50000000049454e44ae426082', 'hex');

/* axe sem violações (inclui contraste, que o jsdom não mede). O app não tem tema escuro próprio: só o claro. */
async function semViolacoes(page, seletor) {
  const builder = new AxeBuilder({ page });
  if (seletor) builder.include(seletor);
  const { violations } = await builder.analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

/* Aperta Tab até o alvo receber o foco (prova que ele é alcançável pelo teclado) */
async function tabAte(page, alvo, max = 30) {
  for (let i = 0; i < max; i += 1) {
    await page.keyboard.press('Tab');
    if (await alvo.evaluate((el) => el === document.activeElement)) return;
  }
  throw new Error('o alvo não recebeu o foco pelo Tab');
}

/* Foco visível com o contorno que o app define em index.css (3px sólido #1d4ed8), não o padrão do navegador.
   expect.poll: nos botões com a classe `transition` do Tailwind, a cor do contorno anima por ~150 ms */
async function focoVisivel(page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const s = getComputedStyle(document.activeElement);
        return `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`;
      })
    )
    .toBe('solid 3px rgb(29, 78, 216)');
}

/* Troca o texto do campo focado: seleciona tudo e digita */
async function digitar(page, texto) {
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type(texto);
}

/* Entra com dados fictícios e envia um cupom, tudo pelo teclado */
async function entrarEEnviar(page) {
  const sufixo = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  await page.goto('/controle-financas/');
  await expect(page.getByRole('heading', { name: 'Configurar acesso' })).toBeVisible();
  await semViolacoes(page);

  /* Dados fictícios: nenhum dado pessoal real */
  const campos = [
    ['Token de acesso da API', TOKEN],
    ['Nome completo', 'Pessoa de Teste'],
    ['E-mail', `teste-${sufixo}@empresa.test`],
    ['Apelido', 'Teste'],
    ['WhatsApp (DDD + número)', '11900000000'],
  ];
  for (const [rotulo, valor] of campos) {
    await tabAte(page, page.getByLabel(rotulo));
    await focoVisivel(page);
    await page.keyboard.type(valor);
  }
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { name: 'Enviar novo cupom fiscal' })).toBeVisible();
  await expect(page.getByText('Nenhum cupom cadastrado ainda.')).toBeVisible();
  await semViolacoes(page);

  await tabAte(page, page.getByLabel(/Foto do cupom/));
  const [seletor] = await Promise.all([page.waitForEvent('filechooser'), page.keyboard.press('Space')]);
  await seletor.setFiles({ name: 'cupom.png', mimeType: 'image/png', buffer: PNG });
  const enviar = page.getByRole('button', { name: 'Enviar e processar cupom' });
  await tabAte(page, enviar);
  await focoVisivel(page);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status').filter({ hasText: /Cupom .* salvo: Mercado Exemplo/ })).toBeVisible();

  const detalhes = page.getByRole('button', { name: /Detalhes do cupom/ }).first();
  await tabAte(page, detalhes);
  await focoVisivel(page);
  await page.keyboard.press('Enter');
  const dialogo = page.getByRole('dialog');
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByText('Pão francês')).toBeVisible();
  await expect(dialogo.getByRole('button', { name: 'Fechar' })).toBeFocused();
  await semViolacoes(page, '[role="dialog"]');
  return { detalhes, dialogo };
}

test('só pelo teclado: entra, envia um cupom, abre o detalhe e aceita a leitura', async ({ page }) => {
  const { detalhes, dialogo } = await entrarEEnviar(page);

  /* O Tab preso no diálogo volta do último botão (Fechar) para o primeiro */
  await page.keyboard.press('Tab');
  await expect(dialogo.getByRole('button', { name: 'Sim, sem correção' })).toBeFocused();
  await focoVisivel(page);
  await page.keyboard.press('Enter');
  await expect(dialogo.getByText('Leitura aceita.')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialogo).toBeHidden();
  await expect(detalhes).toBeFocused();
  await expect(page.locator('dd').filter({ hasText: '100%' })).toBeVisible();
});

test('só pelo teclado: corrige loja, data e total da leitura, com erro ligado ao campo (#29)', async ({ page }) => {
  const { detalhes, dialogo } = await entrarEEnviar(page);

  await tabAte(page, dialogo.getByRole('button', { name: 'Precisei corrigir' }));
  await page.keyboard.press('Enter');
  const loja = dialogo.getByLabel('Loja');
  await expect(loja).toBeFocused();
  await expect(loja).toHaveValue('Mercado Exemplo');
  await digitar(page, 'Mercado Corrigido');
  await page.keyboard.press('Tab');
  await focoVisivel(page);
  await digitar(page, '09/11/2026');
  await page.keyboard.press('Tab');
  await digitar(page, '0');
  await page.keyboard.press('Enter');

  const total = dialogo.getByLabel('Total (R$)');
  await expect(total).toBeFocused();
  await expect(total).toHaveAttribute('aria-invalid', 'true');
  await expect(total).toHaveAccessibleDescription(/maior que zero/);
  await semViolacoes(page, '[role="dialog"]');

  await digitar(page, '25,50');
  await page.keyboard.press('Enter');
  await expect(dialogo.getByRole('status')).toHaveText('Correção salva.');
  await expect(dialogo.getByText(/Total: R\$\s25,50/)).toBeVisible();
  await expect(dialogo.getByRole('button', { name: 'Fechar' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialogo).toBeHidden();
  await expect(detalhes).toBeFocused();
  await expect(page.getByText(/· Mercado Corrigido$/)).toBeVisible();
  await expect(page.getByText('Data: 09/11/2026')).toBeVisible();
  await expect(page.getByText('Mercado Corrigido (1 visita)')).toBeVisible();
  await expect(page.locator('dd').filter({ hasText: /^0%$/ })).toBeVisible();
});
/* Fim de fluxo.spec.js */
