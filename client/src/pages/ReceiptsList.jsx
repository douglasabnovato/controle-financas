/* Catálogo de cupons do perfil com estados de carregando, erro, vazio e detalhe */
import { useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api';
import Notice from '../components/Notice';
import ReceiptDialog from '../components/ReceiptDialog';
import { formatBRL, formatDate } from '../utils/format';

export default function ReceiptsList({ profileId, refreshTrigger }) {
  const [state, setState] = useState({ loading: true, error: '', receipts: [] });
  const [detail, setDetail] = useState(null);

  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    api
      .get('/receipts', { params: { profile_id: profileId } })
      .then((res) => active && setState({ loading: false, error: '', receipts: res.data.receipts }))
      .catch((err) => active && setState({ loading: false, error: errorMessage(err), receipts: [] }));
    return () => {
      active = false;
    };
  }, [profileId, refreshTrigger, reload]);

  /* Reexecuta a busca após um erro */
  function retry() {
    setState((s) => ({ ...s, loading: true, error: '' }));
    setReload((n) => n + 1);
  }

  /* Carrega itens do cupom escolhido */
  async function openDetails(id) {
    try {
      const res = await api.get(`/receipts/${id}`, { params: { profile_id: profileId } });
      setDetail(res.data);
    } catch (err) {
      setState((s) => ({ ...s, error: errorMessage(err) }));
    }
  }

  return (
    <section aria-labelledby="catalog-title" className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <h2 id="catalog-title" className="mb-4 text-lg font-semibold text-gray-900">Catálogo de cupons fiscais</h2>
      {state.loading && <p role="status" className="text-sm text-gray-700">Carregando cupons…</p>}
      {state.error && (
        <>
          <Notice kind="error">{state.error}</Notice>
          <button type="button" onClick={retry} className="mt-2 rounded bg-blue-100 px-3 py-1 text-sm text-blue-900">Tentar novamente</button>
        </>
      )}
      {!state.loading && !state.error && state.receipts.length === 0 && (
        <p className="text-sm text-gray-700">Nenhum cupom cadastrado ainda. Envie a foto do primeiro acima.</p>
      )}
      <ul className="space-y-3">
        {state.receipts.map((r) => (
          <li key={r.id} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-bold text-gray-900">{r.code} · {r.store_name}</p>
              <p className="text-xs text-gray-700">Data: {formatDate(r.purchase_date)}</p>
            </div>
            <div className="text-right">
              <span className="font-semibold text-green-800">{formatBRL(r.total_amount)}</span>
              <button type="button" onClick={() => openDetails(r.id)} className="ml-4 rounded bg-blue-100 px-3 py-1 text-sm text-blue-900 hover:bg-blue-200">
                Detalhes<span className="sr-only"> do cupom {r.code}</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
      {detail && <ReceiptDialog detail={detail} onClose={() => setDetail(null)} />}
    </section>
  );
}
/* Fim de ReceiptsList.jsx */
