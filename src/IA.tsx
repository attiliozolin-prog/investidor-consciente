import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

// Aceita a carteira atual como "propriedade" para analisar
export function IA({ carteira }: { carteira: any }) {
  const [analise, setAnalise] = useState('');
  const [loading, setLoading] = useState(false);

  async function chamarInteligencia() {
    setLoading(true);
    setAnalise('');

    try {
      const resposta = await fetch('/api/consultor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carteira }),
      });

      const dados = await resposta.json();

      if (dados.resultado) {
        setAnalise(dados.resultado);
      } else {
        setAnalise('Ops! A IA não conseguiu responder agora.');
      }
    } catch (erro) {
      console.error(erro);
      setAnalise('Erro de conexão com o cérebro digital.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 p-6 bg-slate-800 rounded-xl border border-slate-700 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          🤖 Consultor IA
        </h3>
        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full border border-green-700">
          IA Ativada
        </span>
      </div>

      <p className="text-slate-400 mb-6 text-sm">
        Clique abaixo para enviar sua carteira atual para análise de riscos e oportunidades ESG.
      </p>

      <button
        onClick={chamarInteligencia}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all transform hover:scale-105 ${
          loading
            ? 'bg-slate-600 cursor-wait'
            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-900/50 shadow-lg'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Analisando Investimentos...
          </span>
        ) : (
          '✨ Gerar Análise de Carteira'
        )}
      </button>

      {analise && (
        <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>
              {analise}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
