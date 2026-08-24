import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 text-center">
        <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
          LearnTECH Ecosystem
        </span>
        <h1 className="text-3xl font-bold mt-4 mb-2 text-white">
          Controle Finanças
        </h1>
        <p className="text-slate-400 mb-6">
          Aplicação web inteligente para catalogação e auditoria de despesas.
        </p>

        <div className="flex flex-col items-center justify-center gap-4">
          <button
            type="button"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
            onClick={() => setCount((count) => count + 1)}
          >
            Contador de Teste: {count}
          </button>
          <span className="text-xs text-slate-500">
            Se este botão estiver estilizado em roxo, o Tailwind v4 está funcionando perfeitamente!
          </span>
        </div>
      </div>
    </div>
  )
}

export default App