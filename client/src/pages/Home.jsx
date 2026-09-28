/* Configuração de acesso: token da API, dados do usuário e primeira BU (ou uso de um perfil existente) */
import { useState } from 'react';
import api, { errorMessage, keys, storage } from '../services/api';
import Notice from '../components/Notice';

const FIELDS = [
  { name: 'full_name', label: 'Nome completo', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email' },
  { name: 'nickname', label: 'Apelido', type: 'text', autoComplete: 'nickname' },
  { name: 'whatsapp', label: 'WhatsApp (DDD + número)', type: 'tel', autoComplete: 'tel-national' },
  { name: 'profile_name', label: 'Business Unit (BU)', type: 'text' },
];

export default function Home({ onLoginSuccess }) {
  const [token, setToken] = useState(storage.get(keys.TOKEN_KEY) || '');
  const [existingProfile, setExistingProfile] = useState('');
  const [formData, setFormData] = useState({ full_name: '', email: '', nickname: '', whatsapp: '', profile_name: 'Despesas Pessoais' });
  const [status, setStatus] = useState({ kind: 'info', text: '' });
  const [busy, setBusy] = useState(false);

  /* Salva o token e, se informado, usa um perfil já existente */
  function saveTokenAndMaybeProfile() {
    storage.set(keys.TOKEN_KEY, token.trim());
    if (existingProfile.trim()) {
      storage.set(keys.PROFILE_KEY, existingProfile.trim());
      onLoginSuccess({ id: existingProfile.trim() });
      return true;
    }
    return false;
  }

  /* Cria usuário e BU na API */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!token.trim()) {
      setStatus({ kind: 'error', text: 'Informe o token de acesso da API.' });
      return;
    }
    if (saveTokenAndMaybeProfile()) return;
    setBusy(true);
    setStatus({ kind: 'info', text: 'Configurando seu acesso…' });
    try {
      const { full_name, email, nickname, whatsapp } = formData;
      const userRes = await api.post('/users', { full_name, email, nickname, whatsapp });
      const profileRes = await api.post('/profiles', { user_id: userRes.data.user.id, profile_name: formData.profile_name });
      storage.set(keys.PROFILE_KEY, profileRes.data.profile.id);
      onLoginSuccess(profileRes.data.profile);
    } catch (error) {
      setStatus({ kind: 'error', text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto mt-10 max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Configurar acesso</h1>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-800">Token de acesso da API</label>
          <input id="token" type="password" autoComplete="off" className="mt-1 w-full rounded-lg border border-gray-400 p-2" value={token} onChange={(e) => setToken(e.target.value)} required />
          <p className="mt-1 text-xs text-gray-700">Fica salvo apenas neste navegador.</p>
        </div>
        <div>
          <label htmlFor="existing" className="block text-sm font-medium text-gray-800">Já tenho um perfil (ID da BU) — opcional</label>
          <input id="existing" type="text" className="mt-1 w-full rounded-lg border border-gray-400 p-2" value={existingProfile} onChange={(e) => setExistingProfile(e.target.value)} />
        </div>
        {!existingProfile && (
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-gray-900">Ou crie seu usuário e a primeira BU</legend>
            {FIELDS.map((f) => (
              <div key={f.name}>
                <label htmlFor={f.name} className="block text-sm font-medium text-gray-800">{f.label}</label>
                <input id={f.name} type={f.type} autoComplete={f.autoComplete} className="mt-1 w-full rounded-lg border border-gray-400 p-2" value={formData[f.name]} onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })} required />
              </div>
            ))}
          </fieldset>
        )}
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-blue-700 py-2 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60">
          {busy ? 'Aguarde…' : 'Entrar'}
        </button>
        <Notice kind={status.kind}>{status.text}</Notice>
      </form>
    </main>
  );
}
/* Fim de Home.jsx */
