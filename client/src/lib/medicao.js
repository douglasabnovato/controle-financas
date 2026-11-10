/* Medição de uso sem cookie (GoatCounter, decisão D5 de 10/11/2026).
   Só carrega no build de produção e fora do próprio computador: dev e testes não contam visitas.
   Nenhum dado pessoal: só o caminho da página e o nome do evento. */
export const ENDERECO_MEDICAO = 'https://douglasabnovato.goatcounter.com/count';
export const SCRIPT_MEDICAO = 'https://gc.zgo.at/count.js';

let carregada = false;

/* Verdadeiro só no build de produção servido fora de localhost */
export function medicaoAtiva(prod = import.meta.env.PROD, host = window.location.hostname) {
  const local = host === '' || host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
  return Boolean(prod) && !local;
}

/* Insere o script do GoatCounter uma vez; devolve se inseriu */
export function carregarMedicao(prod, host) {
  if (!medicaoAtiva(prod, host) || document.querySelector('script[data-goatcounter]')) return false;
  const script = document.createElement('script');
  script.async = true;
  script.src = SCRIPT_MEDICAO;
  script.dataset.goatcounter = ENDERECO_MEDICAO;
  document.head.appendChild(script);
  carregada = true;
  return true;
}

/* Conta um evento do fluxo principal; não faz nada se a medição não foi carregada */
export function registrarEvento(nome) {
  if (!carregada) return;
  window.goatcounter?.count?.({ path: nome, title: nome, event: true });
}

/* Só para os testes: volta ao estado inicial */
export function reiniciarMedicao() {
  carregada = false;
}
/* Fim de medicao.js */
