/* Correção manual de loja, data e total quando a leitura da IA erra (#29): validação, erros ligados aos campos, axe e API */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { parseBRL, parseBRDate } from '../utils/format';

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');
  return { ...actual, default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } };
});
const { default: api } = await import('../services/api');
const { default: ReceiptsList } = await import('../pages/ReceiptsList');
const { default: ReceiptDialog } = await import('../components/ReceiptDialog');

const RECEIPT = { id: 7, code: 'C007', store_name: 'Mercado Errado', purchase_date: '2026-11-10T12:30:00', total_amount: 23.4, cnpj: null, review_status: null };
const DETAIL = { receipt: RECEIPT, products: [{ id: 'a', product_name: 'Arroz', quantity: 1, total_price: 23.4 }] };

/* axe sem a regra de contraste, que o jsdom não calcula (o Playwright mede contraste no navegador) */
async function violations() {
  const result = await axe.run(document.body, { rules: { 'color-contrast': { enabled: false } } });
  return result.violations.map((v) => `${v.id}: ${v.help}`);
}

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('conversão dos campos digitados', () => {
  it('lê o total no formato brasileiro e recusa texto', () => {
    expect(parseBRL('25,50')).toBe(25.5);
    expect(parseBRL('R$ 1.234,56')).toBe(1234.56);
    expect(parseBRL('25.5')).toBe(25.5);
    expect(parseBRL('abc')).toBeNull();
    expect(parseBRL('1,234')).toBeNull();
  });

  it('lê a data DD/MM/AAAA e recusa data que não existe', () => {
    expect(parseBRDate('09/11/2026')).toBe('2026-11-09');
    expect(parseBRDate('30/02/2026')).toBeNull();
    expect(parseBRDate('2026-11-09')).toBeNull();
  });
});

describe('formulário de correção no detalhe', () => {
  it('abre preenchido com a leitura, com foco na loja e sem violações do axe', async () => {
    render(<main><ReceiptDialog detail={DETAIL} onClose={() => {}} onReview={() => {}} onCorrect={vi.fn()} /></main>);
    await userEvent.click(screen.getByRole('button', { name: 'Precisei corrigir' }));
    const loja = screen.getByLabelText('Loja');
    expect(loja.value).toBe('Mercado Errado');
    expect(screen.getByLabelText('Data da compra (DD/MM/AAAA)').value).toBe('10/11/2026');
    expect(screen.getByLabelText('Total (R$)').value).toBe('23,40');
    expect(document.activeElement).toBe(loja);
    expect(await violations()).toEqual([]);
  });

  it('mostra o erro em texto ligado ao campo e põe o foco no primeiro campo com erro', async () => {
    const onCorrect = vi.fn();
    render(<main><ReceiptDialog detail={DETAIL} onClose={() => {}} onReview={() => {}} onCorrect={onCorrect} /></main>);
    await userEvent.click(screen.getByRole('button', { name: 'Precisei corrigir' }));
    const data = screen.getByLabelText('Data da compra (DD/MM/AAAA)');
    const total = screen.getByLabelText('Total (R$)');
    await userEvent.clear(data);
    await userEvent.type(data, '30/02/2026');
    await userEvent.clear(total);
    await userEvent.type(total, '0');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar correção' }));
    expect(onCorrect).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(data);
    expect(data.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(data.getAttribute('aria-describedby')).textContent).toMatch(/data que exista/);
    expect(document.getElementById(total.getAttribute('aria-describedby')).textContent).toMatch(/maior que zero/);
    expect(screen.getByLabelText('Loja').getAttribute('aria-invalid')).toBeNull();
    expect(await violations()).toEqual([]);
  });

  it('prende o Tab também nos campos e Cancelar devolve o foco a "Precisei corrigir"', async () => {
    render(<ReceiptDialog detail={DETAIL} onClose={() => {}} onReview={() => {}} onCorrect={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Precisei corrigir' }));
    const close = screen.getByRole('button', { name: 'Fechar' });
    close.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('Loja'));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(close);
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByLabelText('Loja')).toBeNull();
    await vi.waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Precisei corrigir' })));
  });
});

describe('correção no catálogo, com a API', () => {
  it('envia a correção do perfil, atualiza o catálogo e avisa o painel', async () => {
    const onChange = vi.fn();
    api.get.mockResolvedValueOnce({ data: { receipts: [RECEIPT] } });
    api.get.mockResolvedValueOnce({ data: DETAIL });
    api.patch.mockResolvedValueOnce({ data: { receipt: { ...RECEIPT, store_name: 'Mercado Certo', purchase_date: '2026-11-09T12:00:00', total_amount: 25.5, review_status: 'corrected' } } });
    render(<ReceiptsList profileId="p1" refreshTrigger={0} onChange={onChange} />);
    await userEvent.click(await screen.findByRole('button', { name: /Detalhes do cupom C007/ }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Precisei corrigir' }));
    const loja = within(dialog).getByLabelText('Loja');
    await userEvent.clear(loja);
    await userEvent.type(loja, 'Mercado Certo');
    const data = within(dialog).getByLabelText('Data da compra (DD/MM/AAAA)');
    await userEvent.clear(data);
    await userEvent.type(data, '09/11/2026');
    const total = within(dialog).getByLabelText('Total (R$)');
    await userEvent.clear(total);
    await userEvent.type(total, '25,50{Enter}');

    expect(api.patch).toHaveBeenCalledWith('/receipts/7', { profile_id: 'p1', store_name: 'Mercado Certo', purchase_date: '2026-11-09', total_amount: 25.5 });
    expect((await within(dialog).findByRole('status')).textContent).toBe('Correção salva.');
    expect(within(dialog).getByText('Total: R$ 25,50', { normalizer: (s) => s.replace(/\s/g, ' ') })).toBeTruthy();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Fechar' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.getByText('C007 · Mercado Certo')).toBeTruthy();
  });

  it('mostra no diálogo o erro da API (cupom repetido) e mantém o formulário', async () => {
    api.get.mockResolvedValueOnce({ data: { receipts: [RECEIPT] } });
    api.get.mockResolvedValueOnce({ data: DETAIL });
    api.patch.mockRejectedValueOnce({ response: { status: 409, data: { error: 'Já existe um cupom com esta data e este total neste perfil.', code: 'DUPLICATE' } } });
    render(<ReceiptsList profileId="p1" refreshTrigger={0} />);
    await userEvent.click(await screen.findByRole('button', { name: /Detalhes do cupom C007/ }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Precisei corrigir' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Salvar correção' }));
    expect((await within(dialog).findByRole('alert')).textContent).toMatch(/Já existe um cupom/);
    expect(within(dialog).getByLabelText('Loja')).toBeTruthy();
  });
});
/* Fim de correcao.test.jsx */
