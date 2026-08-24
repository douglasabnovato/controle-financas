import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import ReceiptUpload from './components/ReceiptUpload';
import ReceiptsList from './pages/ReceiptsList';
import DashboardSummary from './components/DashboardSummary';

export default function App() {
  const [profile, setProfile] = useState(null);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const savedProfileId = localStorage.getItem('active_profile_id');
    if (savedProfileId) {
      setProfile({ id: savedProfileId });
    }
  }, []);

  const handleUploadSuccess = () => {
    setRefresh(prev => !prev); // Dispara atualização automática nas listas e dashboard
  };

  if (!profile) {
    return <Home onLoginSuccess={(prof) => setProfile(prof)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">controle-financas | learnTECH</h1>
            <p className="text-xs text-gray-500">Perfil ID ativo: {profile.id}</p>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('active_profile_id'); setProfile(null); }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition">
            Trocar / Sair
          </button>
        </header>

        {/* Dashboard de KPIs */}
        <DashboardSummary refreshTrigger={refresh} />

        {/* Upload de Novo Cupom */}
        <ReceiptUpload onUploadSuccess={handleUploadSuccess} />

        {/* Listagem de Cupons */}
        <ReceiptsList refreshTrigger={refresh} />
      </div>
    </div>
  );
}