import React, { useState } from 'react';
import api from '../services/api';

export default function Home({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    nickname: '',
    whatsapp: '',
    profile_name: 'Despesas Pessoais'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userRes = await api.post('/users', {
        full_name: formData.full_name,
        email: formData.email,
        nickname: formData.nickname,
        whatsapp: formData.whatsapp
      });
      
      const userId = userRes.data.user.id;

      const profileRes = await api.post('/profiles', {
        user_id: userId,
        profile_name: formData.profile_name
      });

      const activeProfile = profileRes.data.profile;
      localStorage.setItem('active_profile_id', activeProfile.id);
      
      alert('Perfil e BU configurados com sucesso!');
      if (onLoginSuccess) onLoginSuccess(activeProfile);
    } catch (error) {
      console.error('Erro ao configurar perfil:', error);
      alert('Erro ao cadastrar usuário/perfil.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurar Acesso - learnTECH</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
          <input type="text" className="w-full mt-1 p-2 border rounded-lg" 
            value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">E-mail</label>
          <input type="email" className="w-full mt-1 p-2 border rounded-lg" 
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Apelido (Nickname)</label>
            <input type="text" className="w-full mt-1 p-2 border rounded-lg" 
              value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
            <input type="text" className="w-full mt-1 p-2 border rounded-lg" 
              value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Unit (BU)</label>
          <input type="text" className="w-full mt-1 p-2 border rounded-lg" 
            value={formData.profile_name} onChange={e => setFormData({...formData, profile_name: e.target.value})} required />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
          Entrar no Ecossistema
        </button>
      </form>
    </div>
  );
}