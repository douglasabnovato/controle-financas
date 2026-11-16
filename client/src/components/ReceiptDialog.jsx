/* Diálogo acessível com os itens do cupom (foco inicial, Tab preso no diálogo, Esc fecha, foco volta ao botão de origem) */
import { useEffect, useRef } from 'react';
import { formatBRL, formatDate, formatQty } from '../utils/format';

const REVIEW_LABELS = { accepted: 'Leitura aceita.', corrected: 'Leitura marcada como corrigida.' };

export default function ReceiptDialog({ detail, onClose, onReview }) {
  const closeRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    closeRef.current?.focus();
    /* Esc fecha; Tab e Shift+Tab circulam só entre os botões do diálogo (padrão modal da WAI-ARIA) */
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab' || !boxRef.current) return;
      const items = [...boxRef.current.querySelectorAll('button:not([disabled])')];
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

  const { receipt, products } = detail;
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
          {receipt.review_status ? (
            <p role="status" className="text-sm text-gray-700">{REVIEW_LABELS[receipt.review_status]}</p>
          ) : (
            <>
              <p className="mb-2 text-sm text-gray-900">A leitura da IA estava certa?</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => onReview('accepted')} className="flex-1 rounded-lg bg-green-700 py-2 text-sm text-white hover:bg-green-800">Sim, sem correção</button>
                <button type="button" onClick={() => onReview('corrected')} className="flex-1 rounded-lg border border-gray-400 py-2 text-sm text-gray-900 hover:bg-gray-100">Precisei corrigir</button>
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
