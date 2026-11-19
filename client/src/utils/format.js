/* Formatação de moeda e data no padrão brasileiro */
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/* Número → "R$ 1.234,56" */
export function formatBRL(value) {
  return brl.format(Number(value) || 0);
}

/* ISO → "10/09/2026". Usa o dia gravado (AAAA-MM-DD do início do texto), sem o fuso do navegador:
   um cupom de 01:30 não aparece com o dia anterior (#45). Sem esse formato, cai na data do navegador. */
export function formatDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ''));
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
}

/* Quantidade com até 3 casas: 0,5 · 1 */
export function formatQty(value) {
  return Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}
/* "25,50", "R$ 1.234,56" ou "25.5" → número; null se não for um valor válido */
export function parseBRL(text) {
  let s = String(text ?? '').trim().replace(/^R\$\s*/, '').replace(/\s/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Number(s);
}

/* "09/11/2026" → "2026-11-09"; null se a data não existir no calendário */
export function parseBRDate(text) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(text ?? '').trim());
  if (!m) return null;
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso ? iso : null;
}
/* Fim de format.js */
