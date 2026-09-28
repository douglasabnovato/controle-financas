/* KPIs do perfil (total de cupons, gasto, ticket médio) e lojas com maior gasto */
import { useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api';
import Notice from './Notice';
import { formatBRL } from '../utils/format';

export default function DashboardSummary({ profileId, refreshTrigger }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get('/receipts/dashboard/summary', { params: { profile_id: profileId } })
      .then((res) => active && (setData(res.data), setError('')))
      .catch((err) => active && setError(errorMessage(err)));
    return () => {
      active = false;
    };
  }, [profileId, refreshTrigger]);

  if (error) return <Notice kind="error">{error}</Notice>;
  if (!data) return <p role="status" className="text-sm text-gray-700">Carregando métricas financeiras…</p>;

  const cards = [
    { label: 'Total de cupons', value: data.summary.total_receipts, tone: 'bg-blue-50 border-blue-100 text-blue-900' },
    { label: 'Total gasto', value: formatBRL(data.summary.total_spent), tone: 'bg-green-50 border-green-100 text-green-900' },
    { label: 'Ticket médio', value: formatBRL(data.summary.average_ticket), tone: 'bg-purple-50 border-purple-100 text-purple-900' },
  ];

  return (
    <section aria-labelledby="dash-title" className="space-y-6">
      <h2 id="dash-title" className="sr-only">Resumo</h2>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl border p-4 ${c.tone}`}>
            <dt className="text-xs font-semibold uppercase">{c.label}</dt>
            <dd className="text-2xl font-bold">{c.value}</dd>
          </div>
        ))}
      </dl>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
        <h3 className="mb-3 font-semibold text-gray-900">Estabelecimentos com maior gasto</h3>
        {data.top_stores.length === 0 ? (
          <p className="text-sm text-gray-700">Os estabelecimentos aparecem aqui depois do primeiro cupom.</p>
        ) : (
          <ol className="space-y-2">
            {data.top_stores.map((s) => (
              <li key={s.store_name} className="flex justify-between rounded-lg bg-gray-50 p-2 text-sm">
                <span className="font-medium text-gray-800">{s.store_name} ({s.visit_count} {s.visit_count === 1 ? 'visita' : 'visitas'})</span>
                <span className="font-bold text-gray-900">{formatBRL(s.spent_at_store)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
/* Fim de DashboardSummary.jsx */
