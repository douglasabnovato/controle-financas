/* Diálogo acessível com os itens do cupom (foco inicial, Tab preso no diálogo, Esc fecha, foco volta ao botão de origem)
   e correção manual de loja, data e total quando a leitura da IA erra (#29) */
import { useEffect, useRef, useState } from 'react';
import { formatBRL, formatDate, formatQty, parseBRDate, parseBRL } from '../utils/format';

const REVIEW_LABELS = { accepted: 'Leitura aceita.', corrected: 'Leitura marcada como corrigida.' };
const FOCUSABLE = 'button:not([disabled]), input:not([disabled])';

/* Dia gravado no banco (AAAA-MM-DD do início do texto), sem passar pelo fuso do navegador:
   assim, salvar sem mexer na data não troca o dia de um cupom lido de madrugada */
function storedDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ''));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

/* true quando a correção repete a leitura: mesma loja, mesmo dia gravado e mesmo total (em centavos) */
function sameAsReading(receipt, values) {
  const day = /^(\d{4}-\d{2}-\d{2})/.exec(String(receipt.purchase_date ?? ''))?.[1];
  return (
    values.store_name === String(receipt.store_name ?? '').trim() &&
    values.purchase_date === day &&
    Math.round(values.total_amount * 100) === Math.round(Number(receipt.total_amount || 0) * 100)
  );
}

/* Valida os campos da correção; devolve { values } ou { errors } com mensagens em texto */
function validate(form) {
  const errors = {};
  const store = form.store.trim();
  const date = parseBRDate(form.date);
  const total = parseBRL(form.total);
  if (!store) errors.store = 'Informe a loja.';
  if (!date) errors.date = 'Use uma data que exista, no formato DD/MM/AAAA.';
  if (total === null || total <= 0) errors.total = 'Informe um total maior que zero, como 25,50.';
  return Object.keys(errors).length ? { errors } : { values: { store_name: store, purchase_date: date, total_amount: total } };
}

/* Formulário de correção: rótulo em cada campo e erro em texto ligado ao campo (WCAG 3.3.1) */
function CorrectionForm({ receipt, onSave, onCancel }) {
  const [form, setForm] = useState({
    store: receipt.store_name || '',
    date: storedDate(receipt.purchase_date),
    total: Number(receipt.total_amount || 0).toFixed(2).replace('.', ','),
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const refs = { store: useRef(null), date: useRef(null), total: useRef(null) };

  useEffect(() => {
    refs.store.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const result = validate(form);
    setServerError('');
    if (result.errors) {
      setErrors(result.errors);
      const first = ['store', 'date', 'total'].find((k) => result.errors[k]);
      refs[first].current?.focus();
      return;
    }
    setErrors({});
    setSaving(true);
    const message = await onSave(result.values);
    setSaving(false);
    if (message) setServerError(message);
  }

  const field = (name, label, extra = {}) => (
    <div>
      <label htmlFor={`fix-${name}`} className="block text-sm font-medium text-gray-800">{label}</label>
      <input
        ref={refs[name]}
        id={`fix-${name}`}
        type="text"
        className="mt-1 w-full rounded-lg border border-gray-400 p-2"
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        aria-invalid={errors[name] ? 'true' : undefined}
        aria-describedby={errors[name] ? `fix-${name}-erro` : undefined}
        {...extra}
      />
      {errors[name] && <p id={`fix-${name}-erro`} className="mt-1 text-sm text-red-800">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="fix-title" className="space-y-3">
      <h3 id="fix-title" className="font-semibold text-gray-900">Corrigir a leitura</h3>
      {field('store', 'Loja', { autoComplete: 'off' })}
      {field('date', 'Data da compra (DD/MM/AAAA)', { inputMode: 'numeric', autoComplete: 'off' })}
      {field('total', 'Total (R$)', { inputMode: 'decimal', autoComplete: 'off' })}
      {serverError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{serverError}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-blue-700 py-2 text-sm text-white hover:bg-blue-800 disabled:opacity-60">
          {saving ? 'Salvando…' : 'Salvar correção'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-gray-400 py-2 text-sm text-gray-900 hover:bg-gray-100">Cancelar</button>
      </div>
    </form>
  );
}

export default function ReceiptDialog({ detail, onClose, onReview, onCorrect }) {
  const closeRef = useRef(null);
  const boxRef = useRef(null);
  const fixButtonRef = useRef(null);
  const [correcting, setCorrecting] = useState(false);
  const [doneMessage, setDoneMessage] = useState('');

  useEffect(() => {
    const opener = document.activeElement;
    closeRef.current?.focus();
    /* Esc fecha; Tab e Shift+Tab circulam só entre os controles do diálogo (padrão modal da WAI-ARIA) */
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab' || !boxRef.current) return;
      const items = [...boxRef.current.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const inside = boxRef.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  /* Cancela a correção e devolve o foco ao botão que a abriu */
  function cancelCorrection() {
    setCorrecting(false);
    setTimeout(() => fixButtonRef.current?.focus(), 0);
  }

  /* Salva a correção; devolve a mensagem de erro, se houver, para o formulário mostrar.
     Sem nenhuma mudança, não chama a API: a leitura não conta como corrigida (#45) */
  async function saveCorrection(values) {
    if (sameAsReading(receipt, values)) {
      setCorrecting(false);
      setDoneMessage('Nada mudou. A leitura segue como estava.');
      setTimeout(() => fixButtonRef.current?.focus(), 0);
      return '';
    }
    const message = await onCorrect(values);
    if (message) return message;
    setCorrecting(false);
    setDoneMessage('Correção salva.');
    closeRef.current?.focus();
    return '';
  }

  const { receipt, products } = detail;
  /* A região role="status" fica sempre no DOM e só o texto muda: assim os leitores de tela anunciam (#45) */
  const statusText = correcting ? '' : doneMessage || REVIEW_LABELS[receipt.review_status] || '';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div ref={boxRef} role="dialog" aria-modal="true" aria-labelledby="receipt-title" className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6">
        <h2 id="receipt-title" className="mb-1 text-xl font-bold text-gray-900">{receipt.code} · {receipt.store_name}</h2>
        <p className="mb-4 text-sm text-gray-700">{formatDate(receipt.purchase_date)} · CNPJ: {receipt.cnpj || 'não informado'}</p>
        <h3 className="mb-2 font-semibold text-gray-900">Itens comprados</h3>
        {products.length === 0 ? (
          <p className="mb-4 text-sm text-gray-700">Nenhum item foi identificado neste cupom.</p>
        ) : (
          <ul className="mb-4 divide-y text-sm">
            {products.map((p) => (
              <li key={p.id} className="flex justify-between py-2">
                <span>{formatQty(p.quantity)} × {p.product_name}</span>
                <span className="font-medium">{formatBRL(p.total_price)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mb-4 text-right font-bold">Total: {formatBRL(receipt.total_amount)}</p>
        <div className="mb-4 rounded-lg border border-gray-200 p-3">
          <p role="status" className={statusText ? 'mb-2 text-sm text-gray-700' : 'sr-only'}>{statusText}</p>
          {correcting ? (
            <CorrectionForm receipt={receipt} onSave={saveCorrection} onCancel={cancelCorrection} />
          ) : receipt.review_status ? null : (
            <>
              <p className="mb-2 text-sm text-gray-900">A leitura da IA estava certa?</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setDoneMessage(''); onReview('accepted'); }} className="flex-1 rounded-lg bg-green-700 py-2 text-sm text-white hover:bg-green-800">Sim, sem correção</button>
                <button ref={fixButtonRef} type="button" onClick={() => (onCorrect ? setCorrecting(true) : onReview('corrected'))} className="flex-1 rounded-lg border border-gray-400 py-2 text-sm text-gray-900 hover:bg-gray-100">Precisei corrigir</button>
              </div>
            </>
          )}
        </div>
        <button ref={closeRef} type="button" onClick={onClose} className="w-full rounded-lg bg-gray-700 py-2 text-white hover:bg-gray-800">Fechar</button>
      </div>
    </div>
  );
}
/* Fim de ReceiptDialog.jsx */
