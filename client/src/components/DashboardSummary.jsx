import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function DashboardSummary({ refreshTrigger }) {
  const [summary, setSummary] = useState(null);
  const [topStores, setTopStores] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      const profile_id = localStorage.getItem('active_profile_id');
      if (!profile_id) return;
      try {
        const res = await api.get(`/receipts/dashboard/summary?profile_id=${profile_id}`);
        setSummary(res.data.summary);
        setTopStores(res.data.top_stores);
      } catch (err) {
        console.error('Erro ao carregar dashboard', err);
      }
    };
    fetchSummary();
  }, [refreshTrigger]);

  if (!summary) return <p className="text-sm text-gray-500">Carregando métricas financeiras...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs text-blue-600 font-semibold uppercase">Total de Cupons</p>
          <p className="text-2xl font-bold text-blue-900">{summary.total_receipts}</p>
        </div>
        <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
          <p className="text-xs text-green-600 font-semibold uppercase">Total Gasto</p>
          <p className="text-2xl font-bold text-green-900">R$ {Number(summary.total_spent).toFixed(2)}</p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
          <p className="text-xs text-purple-600 font-semibold uppercase">Ticket Médio</p>
          <p className="text-2xl font-bold text-purple-900">R$ {Number(summary.average_ticket).toFixed(2)}</p>
        </div>
      </div>

      <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
        <h4 className="font-semibold text-gray-800 mb-3">Estabelecimentos Mais Frequentes (Top Lojas)</h4>
        <ul className="space-y-2">
          {topStores.map((store, idx) => (
            <li key={idx} className="flex justify-between p-2 bg-gray-50 rounded-lg text-sm">
              <span className="font-medium text-gray-700">{store.store_name} ({store.visit_count} visitas)</span>
              <span className="font-bold text-gray-900">R$ {Number(store.spent_at_store).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}