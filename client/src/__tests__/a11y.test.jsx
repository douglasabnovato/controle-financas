/* Acessibilidade das telas depois do login: axe sem violações, foco preso no diálogo e reenvio de foto (issues #20 e #21) */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');
  return { ...actual, default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } };
});
const { default: api } = await import('../services/api');
const { default: ReceiptsList } = await import('../pages/ReceiptsList');
const { default: ReceiptUpload } = await import('../components/ReceiptUpload');
const { default: ReceiptDialog } = await import('../components/ReceiptDialog');
const { default: DashboardSummary } = await import('../components/DashboardSummary');

const RECEIPT = { id: 1, code: 'C001', store_name: 'Mercado', purchase_date: '2026-09-10T10:00:00Z', total_amount: 10, cnpj: null };
const DETAIL = { receipt: RECEIPT, products: [{ id: 'a', product_name: 'Arroz', quantity: 1, total_price: 10 }] };

/* Roda o axe no documento; contraste fica de fora porque o jsdom não calcula cores (medido com Lighthouse) */
async function violations() {
  const result = await axe.run(document.body, { rules: { 'color-contrast': { enabled: false } } });
  expect(result.passes.length).toBeGreaterThan(5);
  return result.violations.map((v) => `${v.id}: ${v.help}`);
}

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  globalThis.URL.createObjectURL = () => 'blob:x';
  globalThis.URL.revokeObjectURL = () => {};
});

describe('axe nas telas depois do login', () => {
  it('ReceiptUpload sem violações, com as dicas de foto', async () => {
    render(<main><ReceiptUpload profileId="p1" /></main>);
    const tips = screen.getByRole('list', { name: 'Dicas para a foto' });
    expect(tips.querySelectorAll('li')).toHaveLength(3);
    expect(await violations()).toEqual([]);
  });

  it('ReceiptsList com cupom sem violações', async () => {
    api.get.mockResolvedValueOnce({ data: { receipts: [RECEIPT] } });
    render(<main><ReceiptsList profileId="p1" refreshTrigger={0} /></main>);
    await screen.findByText(/C001 · Mercado/);
    expect(await violations()).toEqual([]);
  });

  it('ReceiptDialog sem violações', async () => {
    render(<main><ReceiptDialog detail={DETAIL} onClose={() => {}} onReview={() => {}} /></main>);
    expect(await violations()).toEqual([]);
  });

  it('DashboardSummary sem violações', async () => {
    api.get.mockResolvedValueOnce({ data: { summary: { total_receipts: 1, total_spent: 10, average_ticket: 10 }, reading_review: { acceptance_rate: 100 }, top_stores: [{ store_name: 'Mercado', visit_count: 1, spent_at_store: 10 }] } });
    render(<main><DashboardSummary profileId="p1" refreshTrigger={0} /></main>);
    await screen.findByText('Total de cupons');
    expect(await violations()).toEqual([]);
  });
});

describe('Teclado no detalhe do cupom', () => {
  it('abre só com teclado, prende o Tab no diálogo e devolve o foco ao botão de origem', async () => {
    api.get.mockResolvedValueOnce({ data: { receipts: [RECEIPT] } });
    api.get.mockResolvedValueOnce({ data: DETAIL });
    render(<ReceiptsList profileId="p1" refreshTrigger={0} />);
    const opener = await screen.findByRole('button', { name: /Detalhes do cupom C001/ });
    await userEvent.tab();
    expect(document.activeElement).toBe(opener);
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('dialog');
    const close = screen.getByRole('button', { name: 'Fechar' });
    expect(document.activeElement).toBe(close);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Sim, sem correção' }));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(close);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});

describe('Reenvio quando a IA não lê o cupom', () => {
  it('mostra "Enviar outra foto", limpa o arquivo e volta o foco ao campo', async () => {
    api.post.mockRejectedValueOnce({ response: { status: 422, data: { error: 'Não foi possível ler este cupom. Envie uma foto mais nítida.', code: 'AI_UNREADABLE' } } });
    render(<ReceiptUpload profileId="p1" />);
    const input = screen.getByLabelText(/Foto do cupom/);
    await userEvent.upload(input, new File(['x'], 'cupom.png', { type: 'image/png' }));
    await userEvent.click(screen.getByRole('button', { name: /Enviar e processar/ }));
    expect((await screen.findByRole('alert')).textContent).toMatch(/foto mais nítida/);
    await userEvent.click(screen.getByRole('button', { name: 'Enviar outra foto' }));
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe('');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByRole('button', { name: /Enviar e processar/ }).disabled).toBe(true);
  });

  it('esconde "Enviar outra foto" ao reenviar a mesma foto com sucesso', async () => {
    api.post.mockRejectedValueOnce({ response: { status: 422, data: { error: 'O cupom foi lido, mas os dados vieram incompletos. Tente outra foto.', code: 'AI_INVALID' } } });
    api.post.mockResolvedValueOnce({ data: { receipt: { code: 'C002', store_name: 'Padaria', total_amount: 5 } } });
    render(<ReceiptUpload profileId="p1" />);
    await userEvent.upload(screen.getByLabelText(/Foto do cupom/), new File(['x'], 'cupom.png', { type: 'image/png' }));
    await userEvent.click(screen.getByRole('button', { name: /Enviar e processar/ }));
    await screen.findByRole('button', { name: 'Enviar outra foto' });
    await userEvent.click(screen.getByRole('button', { name: /Enviar e processar/ }));
    expect((await screen.findByRole('status')).textContent).toMatch(/C002 salvo/);
    expect(screen.queryByRole('button', { name: 'Enviar outra foto' })).toBeNull();
  });

  it('não oferece reenvio quando o erro não é de leitura', async () => {
    api.post.mockRejectedValueOnce({ response: { status: 409, data: { error: 'Este cupom já foi cadastrado neste perfil.', code: 'DUPLICATE' } } });
    render(<ReceiptUpload profileId="p1" />);
    await userEvent.upload(screen.getByLabelText(/Foto do cupom/), new File(['x'], 'cupom.png', { type: 'image/png' }));
    await userEvent.click(screen.getByRole('button', { name: /Enviar e processar/ }));
    await screen.findByRole('alert');
    expect(screen.queryByRole('button', { name: 'Enviar outra foto' })).toBeNull();
  });
});
/* Fim de a11y.test.jsx */
