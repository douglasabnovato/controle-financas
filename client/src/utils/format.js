/* Formatação de moeda e data no padrão brasileiro */
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/* Número → "R$ 1.234,56" */
export function formatBRL(value) {
  return brl.format(Number(value) || 0);
}

/* ISO → "10/09/2026" */
export function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
}

/* Quantidade com até 3 casas: 0,5 · 1 */
export function formatQty(value) {
  return Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}
/* Fim de format.js */
