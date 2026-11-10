/* Medição (D5): o GoatCounter não carrega no dev nem nos testes, e o evento só sai com o site em produção */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { ENDERECO_MEDICAO, carregarMedicao, medicaoAtiva, registrarEvento, reiniciarMedicao } from '../lib/medicao';

afterEach(() => {
  document.head.querySelectorAll('script[data-goatcounter]').forEach((s) => s.remove());
  delete window.goatcounter;
  reiniciarMedicao();
});

describe('medição de uso', () => {
  it('não carrega nos testes (sem build de produção)', () => {
    expect(medicaoAtiva()).toBe(false);
    expect(carregarMedicao()).toBe(false);
    expect(document.querySelector('script[data-goatcounter]')).toBeNull();
  });

  it('não carrega no próprio computador, nem com build de produção', () => {
    for (const host of ['localhost', '127.0.0.1', '[::1]', '']) expect(medicaoAtiva(true, host)).toBe(false);
  });

  it('carrega uma vez no site publicado, com o código do portfólio', () => {
    expect(carregarMedicao(true, 'douglasabnovato.github.io')).toBe(true);
    expect(carregarMedicao(true, 'douglasabnovato.github.io')).toBe(false);
    const scripts = document.querySelectorAll('script[data-goatcounter]');
    expect(scripts).toHaveLength(1);
    expect(scripts[0].dataset.goatcounter).toBe(ENDERECO_MEDICAO);
  });

  it('registra o envio do cupom como evento, sem dado pessoal, só depois de carregar', () => {
    const count = vi.fn();
    window.goatcounter = { count };
    registrarEvento('enviar-cupom');
    expect(count).not.toHaveBeenCalled();
    carregarMedicao(true, 'douglasabnovato.github.io');
    registrarEvento('enviar-cupom');
    expect(count).toHaveBeenCalledWith({ path: 'enviar-cupom', title: 'enviar-cupom', event: true });
  });
});
/* Fim de medicao.test.js */
