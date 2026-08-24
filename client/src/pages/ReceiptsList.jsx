import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ReceiptsList({ refreshTrigger }) {
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [products, setProducts] = useState([]);

  const fetchReceipts = async () => {
    const profile_id = localStorage.getItem('active_profile_id');
    if (!profile_id) return;
    try {
      const res = await api.get(`/receipts?profile_id=${profile_id}`);
      setReceipts(res.data.receipts);
    } catch (err) {
      console.error('Erro ao buscar recibos', err);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [refreshTrigger]);

  const handleOpenDetails = async (id) => {
    try {
      const res = await api.get(`/receipts/${id}`);
      setSelectedReceipt(res.data.receipt);
      setProducts(res.data.products);
    } catch (err) {
      console.error('Erro ao buscar detalhes', err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Catálogo de Cupons Fiscais</h3>
      <div className="space-y-3">
        {receipts.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum cupom cadastrado ainda.</p>
        ) : (
          receipts.map((r) => (
            <div key={r.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <p className="font-bold text-gray-700">{r.store_name}</p>
                <p className="text-xs text-gray-500">Data: {new Date(r.purchase_date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <span className="font-semibold text-green-600">R$ {r.total_amount}</span>
                <button onClick={() => handleOpenDetails(r.id)} className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200">
                  Detalhes
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h4 className="text-xl font-bold mb-2">{selectedReceipt.store_name}</h4>
            <p className="text-sm text-gray-500 mb-4">CNPJ: {selectedReceipt.cnpj}</p>
            <h5 className="font-semibold text-gray-700 mb-2">Itens Comprados:</h5>
            <ul className="divide-y text-sm mb-4">
              {products.map(p => (
                <li key={p.id} className="py-2 flex justify-between">
                  <span>{p.quantity}x {p.product_name}</span>
                  <span className="font-medium">R$ {p.total_price}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => setSelectedReceipt(null)} className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}