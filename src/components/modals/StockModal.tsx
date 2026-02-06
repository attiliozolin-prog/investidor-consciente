import React, { useState } from "react";
import { X, ExternalLink, Leaf, AlertTriangle, CheckCircle2, Sparkles, Loader2, Info } from "lucide-react";
import { UserProfile } from "../../types";

// --- COMPONENTE DE LOGO ---
const ModalStockLogo = ({ ticker, size = "lg" }: { ticker: string, size?: "sm" | "md" | "lg" }) => {
  const [errorCount, setErrorCount] = useState(0);
  
  const sources = [
    `https://raw.githubusercontent.com/thecapybara/br-logos/main/logos/${ticker.toUpperCase()}.png`,
    `https://raw.githubusercontent.com/lbcosta/b3-logos/main/png/${ticker.toUpperCase()}.png`
  ];

  const sizeClasses = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-16 h-16 text-xl"
  };

  if (errorCount >= sources.length) {
    return (
      <div className={`${sizeClasses[size]} rounded-2xl bg-gray-100 text-gray-500 font-bold flex items-center justify-center border border-gray-200 select-none shadow-inner`}>
        {ticker.substring(0, 2)}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-white flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm p-1`}>
      <img
        src={sources[errorCount]}
        alt={ticker}
        className="w-full h-full object-contain"
        onError={() => setErrorCount(prev => prev + 1)}
      />
    </div>
  );
};

// --- FORMATADOR DE TEXTO (CORREÇÃO VISUAL) ---
// Transforma os símbolos ## e ** da IA em HTML bonito
const renderMarkdown = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');

  return lines.map((line, index) => {
    // 1. Títulos (## Título)
    if (line.trim().startsWith('##')) {
      return (
        <h3 key={index} className="text-base font-bold text-gray-900 mt-4 mb-2">
          {line.replace(/^##\s*/, '')}
        </h3>
      );
    }

    // 2. Linhas Vazias
    if (line.trim() === '') {
      return <div key={index} className="h-2" />;
    }

    // 3. Negrito (**Texto**)
    const parts = line.split('**');
    const content = parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="font-bold text-gray-900">{part}</strong> : part
    );

    // 4. Parágrafos Normais
    return (
      <p key={index} className="text-sm text-gray-600 mb-1 leading-relaxed">
        {content}
      </p>
    );
  });
};

interface StockModalProps {
  stock: any;
  user: UserProfile;
  coherenceScore: number;
  onClose: () => void;
}

const StockModal: React.FC<StockModalProps> = ({ stock, user, coherenceScore, onClose }) => {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(false);

  let scoreColor = "bg-gray-100 text-gray-800";
  let scoreIcon = <CheckCircle2 size={20} />;
  let scoreText = "Análise neutra.";

  if (coherenceScore >= 70) {
    scoreColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
    scoreText = `Excelente alinhamento ESG (Nota Livo: ${coherenceScore}).`;
  } else if (coherenceScore >= 50) {
    scoreColor = "bg-yellow-50 text-yellow-700 border-yellow-100";
    scoreIcon = <Info size={20} />; 
    scoreText = `Alinhamento ESG mediano (Nota Livo: ${coherenceScore}).`;
  } else {
    scoreColor = "bg-red-50 text-red-700 border-red-100";
    scoreIcon = <AlertTriangle size={20} />;
    scoreText = `Baixo alinhamento ESG (Nota Livo: ${coherenceScore}).`;
  }

  const handleGenerateSummary = async () => {
    setIsLoadingAi(true);
    setAiError(false);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: stock.ticker, name: stock.name })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAiSummary(data.summary);
    } catch (err) {
      console.error(err);
      setAiError(true);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div className="flex items-center gap-4">
            <ModalStockLogo ticker={stock.ticker} size="lg" />
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">{stock.ticker}</h2>
              <p className="text-sm text-gray-500 font-medium">{stock.name}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {stock.sector && (
                   <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                     {stock.sector}
                   </span>
                )}
                {stock.assetType === 'fii' && (
                   <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                     Fundo Imobiliário
                   </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Score Card */}
          <div className={`p-4 rounded-2xl border ${scoreColor} flex gap-3`}>
            <div className="mt-0.5 shrink-0">{scoreIcon}</div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide opacity-90">Análise Livo</h3>
              <p className="text-sm mt-1 font-medium leading-snug">
                {scoreText}
              </p>
            </div>
          </div>

          {/* SEÇÃO IA: LIVO INTELLIGENCE */}
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-600" />
                  Livo Intelligence
                </h3>
                {aiSummary && (
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Gerado por IA</span>
                )}
             </div>

             {!aiSummary && !isLoadingAi && (
               <button 
                 onClick={handleGenerateSummary}
                 className="w-full py-3 rounded-xl border border-purple-100 bg-purple-50 text-purple-700 font-bold text-sm hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
               >
                 <Sparkles size={16} />
                 Gerar Resumo Inteligente da Empresa
               </button>
             )}

             {isLoadingAi && (
               <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-gray-400 gap-2">
                 <Loader2 size={24} className="animate-spin text-purple-500" />
                 <span className="text-xs">Consultando dados e gerando análise...</span>
               </div>
             )}
             
             {aiError && (
               <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs text-center">
                 Erro ao gerar resumo. Verifique se a chave API está configurada.
               </div>
             )}

             {aiSummary && (
               <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-sm text-sm animate-in fade-in">
                 {/* AQUI USAMOS O FORMATADOR */}
                 {renderMarkdown(aiSummary)}
               </div>
             )}
          </div>

          <hr className="border-gray-100" />

          {/* Selos */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Leaf size={16} className="text-emerald-600"/> Índices e Selos B3
            </h4>
            
            {stock.tags && stock.tags.length > 0 ? (
              <div className="space-y-2">
                {stock.tags.map((tag: string) => (
                  <div key={tag} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                       <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block text-sm">{tag}</span>
                      <span className="text-xs text-gray-500">Índice oficial reconhecido pela B3.</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                <p className="text-xs text-gray-400">
                  Esta empresa ainda não faz parte dos principais índices de sustentabilidade da B3 (ISE, ICO2, IGPTW).
                </p>
              </div>
            )}
          </div>

          {/* Indicadores */}
          <div>
             <h4 className="text-sm font-bold text-gray-900 mb-3">Indicadores de Mercado</h4>
             <div className="grid grid-cols-2 gap-3">
               <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                 <span className="text-[10px] text-gray-400 uppercase font-bold">Preço Atual</span>
                 <div className="text-lg font-bold text-gray-900">R$ {stock.price?.toFixed(2)}</div>
               </div>
               <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                 <span className="text-[10px] text-gray-400 uppercase font-bold">Variação (Dia)</span>
                 <div className={`text-lg font-bold ${stock.change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                   {stock.change > 0 ? "+" : ""}{stock.change?.toFixed(2)}%
                 </div>
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StockModal;
