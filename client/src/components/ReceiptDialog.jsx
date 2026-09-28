/* Diálogo acessível com os itens do cupom (foco inicial, Esc fecha, foco volta ao botão de origem) */
import { useEffect, useRef } from 'react';
import { formatBRL, formatDate, formatQty } from '../utils/format';

export default function ReceiptDialog({ detail, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  const { receipt, products } = detail;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="receipt-title" className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6">
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
        <button ref={closeRef} type="button" onClick={onClose} className="w-full rounded-lg bg-gray-700 py-2 text-white hover:bg-gray-800">Fechar</button>
      </div>
    </div>
  );
}
/* Fim de ReceiptDialog.jsx */
