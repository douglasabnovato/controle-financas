/* Testes de interface: formatação, estados de erro/vazio e mensagens sem alert() */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { formatBRL, formatQty } from '../utils/format';

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');
  return { ...actual, default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } };
});
const { default: api } = await import('../services/api');
const { default: ReceiptsList } = await import('../pages/ReceiptsList');
const { default: ReceiptUpload } = await import('../components/ReceiptUpload');
const { default: Home } = await import('../pages/Home');
const { checkApiHealth } = await import('../services/api');

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('format', () => {
  it('formata moeda e quantidade em pt-BR', () => {
    expect(formatBRL(1234.5)).toMatch(/R\$\s1\.234,50/);
    expect(formatQty(0.5)).toBe('0,5');
  });
});

describe('ReceiptsList', () => {
  it('mostra estado vazio', async () => {
    api.get.mockResolvedValue({ data: { receipts: [] } });
    render(<ReceiptsList profileId="p1" refreshTrigger={0} />);
    expect(await screen.findByText(/Nenhum cupom cadastrado/)).toBeTruthy();
  });

  it('mostra erro e tenta novamente', async () => {
    api.get.mockRejectedValueOnce({ response: { data: { error: 'Informe o token de acesso.' } } });
    api.get.mockResolvedValueOnce({ data: { receipts: [{ id: 1, code: 'C001', store_name: 'Mercado', purchase_date: '2026-09-10T10:00:00Z', total_amount: 10 }] } });
    render(<ReceiptsList profileId="p1" refreshTrigger={0} />);
    expect((await screen.findByRole('alert')).textContent).toMatch(/token/);
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText(/C001 · Mercado/)).toBeTruthy();
  });

  it('abre o detalhe em diálogo acessível e fecha com Esc', async () => {
    api.get.mockResolvedValueOnce({ data: { receipts: [{ id: 1, code: 'C001', store_name: 'Mercado', purchase_date: '2026-09-10T10:00:00Z', total_amount: 10 }] } });
    api.get.mockResolvedValueOnce({ data: { receipt: { code: 'C001', store_name: 'Mercado', purchase_date: '2026-09-10T10:00:00Z', total_amount: 10, cnpj: null }, products: [{ id: 'a', product_name: 'Arroz', quantity: 1, total_price: 10 }] } });
    render(<ReceiptsList profileId="p1" refreshTrigger={0} />);
    await userEvent.click(await screen.findByRole('button', { name: /Detalhes do cupom C001/ }));
    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(api.get).toHaveBeenLastCalledWith('/receipts/1', { params: { profile_id: 'p1' } });
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('Revisão da leitura', () => {
  it('registra a leitura aceita, sem enviar dados do cupom', async () => {
    api.get.mockResolvedValueOnce({ data: { receipts: [{ id: 1, code: 'C001', store_name: 'Mercado', purchase_date: '2026-09-10T10:00:00Z', total_amount: 10, document_type: 'cupom_fiscal' }] } });
    api.get.mockResolvedValueOnce({ data: { receipt: { id: 1, code: 'C001', store_name: 'Mercado', purchase_date: '2026-09-10T10:00:00Z', total_amount: 10, cnpj: null }, products: [] } });
    api.patch.mockResolvedValueOnce({ data: { receipt: { id: 1, review_status: 'accepted' } } });
    render(<ReceiptsList profileId="p1" refreshTrigger={0} />);
    await userEvent.click(await screen.findByRole('button', { name: /Detalhes do cupom C001/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Sim, sem correção' }));
    expect(api.patch).toHaveBeenCalledWith('/receipts/1/review', { profile_id: 'p1', status: 'accepted' });
    expect(await screen.findByText('Leitura aceita.')).toBeTruthy();
  });
});

describe('ReceiptUpload', () => {
  it('exibe a mensagem da API quando o cupom é duplicado', async () => {
    api.post.mockRejectedValue({ response: { data: { error: 'Este cupom já foi cadastrado neste perfil.' } } });
    render(<ReceiptUpload profileId="p1" />);
    globalThis.URL.createObjectURL = () => 'blob:x';
    globalThis.URL.revokeObjectURL = () => {};
    const file = new File(['x'], 'cupom.png', { type: 'image/png' });
    await userEvent.upload(screen.getByLabelText(/Foto do cupom/), file);
    await userEvent.click(screen.getByRole('button', { name: /Enviar e processar/ }));
    expect((await screen.findByRole('alert')).textContent).toMatch(/já foi cadastrado/);
  });
});

describe('Estado da API na entrada', () => {
  it('classifica a resposta do /health', async () => {
    api.get.mockResolvedValueOnce({ data: { status: 'ok' } });
    expect(await checkApiHealth(api)).toBe('ok');
    api.get.mockRejectedValueOnce({ response: { status: 404 } });
    expect(await checkApiHealth(api)).toBe('desatualizada');
    api.get.mockRejectedValueOnce({ code: 'ECONNABORTED' });
    expect(await checkApiHealth(api)).toBe('fora');
    expect(api.get.mock.calls[0][0]).toMatch(/\/health$/);
  });

  it('avisa quando a API publicada é antiga', async () => {
    api.get.mockRejectedValueOnce({ response: { status: 404 } });
    render(<Home onLoginSuccess={() => {}} />);
    expect((await screen.findByRole('alert')).textContent).toMatch(/versão antiga/);
  });

  it('avisa quando a API não responde', async () => {
    api.get.mockRejectedValueOnce({ message: 'Network Error' });
    render(<Home onLoginSuccess={() => {}} />);
    expect((await screen.findByRole('alert')).textContent).toMatch(/não respondeu/);
  });

  it('não mostra aviso quando a API está no ar', async () => {
    api.get.mockResolvedValueOnce({ data: { status: 'ok' } });
    render(<Home onLoginSuccess={() => {}} />);
    await screen.findByRole('heading', { name: 'Configurar acesso' });
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
/* Fim de app.test.jsx */
