import React, { useState } from 'react';
import api from '../services/api';

export default function ReceiptUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('Selecione uma imagem!');
    const profile_id = localStorage.getItem('active_profile_id');
    if (!profile_id) return alert('Configure o perfil/BU primeiro.');

    const formData = new FormData();
    formData.append('receipt_image', file);
    formData.append('profile_id', profile_id);

    try {
      setLoading(true);
      const response = await api.post('/receipts/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Cupom processado e salvo com IA!');
      setFile(null);
      setPreview(null);
      if (onUploadSuccess) onUploadSuccess(response.data);
    } catch (error) {
      console.error('Erro ao enviar cupom:', error);
      alert('Erro ao processar imagem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Enviar Novo Cupom Fiscal</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
      
      {preview && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Pré-visualização local (Privacidade garantida):</p>
          <img src={preview} alt="Preview" className="h-48 object-contain mx-auto rounded-lg border" />
        </div>
      )}

      <button onClick={handleUpload} disabled={loading || !file} 
        className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition">
        {loading ? 'Processando com IA (Gemini)...' : 'Enviar e Processar Cupom'}
      </button>
    </div>
  );
}