/* Mensagem de status acessível (substitui alert): sucesso anuncia com status, erro com alert */
export default function Notice({ kind = 'info', children }) {
  if (!children) return null;
  const styles = {
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };
  return (
    <p role={kind === 'error' ? 'alert' : 'status'} className={`mt-3 rounded-lg border p-3 text-sm ${styles[kind]}`}>
      {children}
    </p>
  );
}
/* Fim de Notice.jsx */
