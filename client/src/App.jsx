/* Aplicação: configura acesso e exibe dashboard, envio e catálogo do perfil ativo */
import { useState } from 'react';
import Home from './pages/Home';
import ReceiptUpload from './components/ReceiptUpload';
import ReceiptsList from './pages/ReceiptsList';
import DashboardSummary from './components/DashboardSummary';
import { keys, storage } from './services/api';

export default function App() {
  const [profileId, setProfileId] = useState(() => (storage.get(keys.TOKEN_KEY) ? storage.get(keys.PROFILE_KEY) : null));
  const [refresh, setRefresh] = useState(0);

  if (!profileId) return <Home onLoginSuccess={(p) => setProfileId(p.id)} />;

  /* Sai do perfil atual mantendo o token */
  function switchProfile() {
    storage.remove(keys.PROFILE_KEY);
    setProfileId(null);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">controle-financas | learnTECH</h1>
            <p className="text-xs text-gray-700">Perfil ativo: <code>{profileId}</code></p>
          </div>
          <button type="button" onClick={switchProfile} className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-200">Trocar perfil</button>
        </header>
        <main className="space-y-6">
          <DashboardSummary profileId={profileId} refreshTrigger={refresh} />
          <ReceiptUpload profileId={profileId} onUploadSuccess={() => setRefresh((n) => n + 1)} />
          <ReceiptsList profileId={profileId} refreshTrigger={refresh} />
        </main>
      </div>
    </div>
  );
}
/* Fim de App.jsx */
