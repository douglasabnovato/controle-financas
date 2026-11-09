/* Envio de foto do cupom: dicas de foto, pré-visualização local, envio à API, mensagens de status e reenvio quando a IA não lê */
import { useEffect, useRef, useState } from 'react';
import api, { errorMessage } from '../services/api';
import Notice from './Notice';
import { formatBRL } from '../utils/format';

/* Erros de leitura da IA que uma foto melhor costuma resolver */
const RETAKE_CODES = ['AI_UNREADABLE', 'AI_INVALID'];

/* Dicas de captura citadas por apps de leitura de recibos (fontes no PLANO-DE-ACAO.md) */
const PHOTO_TIPS = ['Deixe o cupom plano, sem dobras.', 'Enquadre o cupom inteiro, do nome da loja ao total.', 'Fotografe com boa luz e sem sombra da mão.'];

export default function ReceiptUpload({ profileId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ kind: 'info', text: '' });
  const [canRetake, setCanRetake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  /* Guarda o arquivo escolhido e gera a prévia */
  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    setStatus({ kind: 'info', text: '' });
    setCanRetake(false);
    setFile(selected || null);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  }

  /* Envia a imagem para leitura por IA */
  async function handleUpload() {
    if (!file) {
      setStatus({ kind: 'error', text: 'Selecione a foto de um cupom.' });
      return;
    }
    const formData = new FormData();
    formData.append('receipt_image', file);
    formData.append('profile_id', profileId);
    try {
      setLoading(true);
      setStatus({ kind: 'info', text: 'Lendo o cupom com IA… isso leva alguns segundos.' });
      const { data } = await api.post('/receipts/process', formData);
      setStatus({ kind: 'success', text: `Cupom ${data.receipt.code} salvo: ${data.receipt.store_name}, ${formatBRL(data.receipt.total_amount)}.` });
      setFile(null);
      setPreview(null);
      onUploadSuccess?.(data);
    } catch (error) {
      setStatus({ kind: 'error', text: errorMessage(error) });
      setCanRetake(RETAKE_CODES.includes(error?.response?.data?.code));
    } finally {
      setLoading(false);
    }
  }

  /* Limpa a foto que a IA não leu e devolve o foco ao campo de arquivo */
  function handleRetake() {
    setFile(null);
    setPreview(null);
    setCanRetake(false);
    setStatus({ kind: 'info', text: '' });
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }

  return (
    <section aria-labelledby="upload-title" className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <h2 id="upload-title" className="mb-4 text-lg font-semibold text-gray-900">Enviar novo cupom fiscal</h2>
      <ul aria-label="Dicas para a foto" className="mb-4 list-disc space-y-1 pl-5 text-sm text-gray-700">
        {PHOTO_TIPS.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
      <label htmlFor="receipt-file" className="mb-2 block text-sm font-medium text-gray-800">Foto do cupom (JPG, PNG, WEBP ou HEIC, até 5 MB)</label>
      <input ref={inputRef} id="receipt-file" type="file" accept="image/jpeg,image/png,image/webp,image/heic" capture="environment" onChange={handleFileChange} className="mb-4 block w-full text-sm text-gray-800 file:mr-4 file:rounded-full file:border-0 file:bg-blue-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-900" />
      {preview && (
        <figure className="mb-4">
          <img src={preview} alt="Pré-visualização do cupom selecionado" className="mx-auto h-48 rounded-lg border object-contain" />
          <figcaption className="mt-1 text-center text-xs text-gray-700">A imagem é enviada ao Google Gemini só para leitura e não fica salva no servidor.</figcaption>
        </figure>
      )}
      <button type="button" onClick={handleUpload} disabled={loading || !file} className="w-full rounded-lg bg-green-700 py-2 font-semibold text-white transition hover:bg-green-800 disabled:bg-gray-400">
        {loading ? 'Processando com IA…' : 'Enviar e processar cupom'}
      </button>
      <Notice kind={status.kind}>{status.text}</Notice>
      {canRetake && (
        <button type="button" onClick={handleRetake} className="mt-2 w-full rounded-lg border border-gray-400 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100">
          Enviar outra foto
        </button>
      )}
    </section>
  );
}
/* Fim de ReceiptUpload.jsx */
