import React, { useState } from "react";
import { X, ExternalLink, Leaf, AlertTriangle, CheckCircle2, Sparkles, Loader2, Info, ShieldAlert, TrendingUp } from "lucide-react";
import { UserProfile } from "../../types";

// --- DICIONÁRIO DE SELOS (MANTIDO) ---
const BADGE_DEFINITIONS: Record<string, string> = {
  "ISE": "Índice de Sustentabilidade Empresarial: Padrão ouro em ESG.",
  "ICO2": "Índice Carbono Eficiente: Compromisso com emissões.",
  "IGPTW": "Melhores empresas para se trabalhar (GPTW).",
  "IDIVERSA": "Destaque em diversidade de gênero e raça.",
  "IGCT": "Governança Corporativa de alto padrão.",
  "ALERTA": "Pontos de atenção identificados pela Livo."
};

// --- COMPONENTE DE LOGO (MANTIDO) ---
const ModalStockLogo = ({ ticker, logoUrl, size = "lg" }: { ticker: string, logoUrl?: string, size?: "sm" | "md" | "lg" }) => {
  const [errorCount, setErrorCount] = useState(0);
  const sources = [
    logoUrl,
    `https://raw.githubusercontent.com/thecapybara/br-logos/main/logos/${ticker.toUpperCase()}.png`,
    `https://raw.githubusercontent.com/lbcosta/b3-logos/main/png/${ticker.toUpperCase()}.png`
  ].filter(Boolean) as string[];

  const sizeClasses = { sm: "w-8 h-8 text-[10px]", md: "w-10 h-10 text-xs", lg: "w-16 h-16 text-xl" };

  if (errorCount >= sources.length) {
    return (
      <div className={`${sizeClasses[size]} rounded-2xl bg-gray-100 text-gray-500 font-bold flex items-center justify-center border border-gray-200 select-none shadow-inner`}>
        {ticker.substring(0, 2)}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-white flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm p-1`}>
      <img src={sources[errorCount]} alt={ticker} className="w-full h-full object-contain" onError={() => setErrorCount(prev => prev + 1)} />
    </div>
  );
};

// --- FORMATADOR MARKDOWN (MANTIDO) ---
const renderMarkdown = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, index) => {
    if (line.trim().startsWith('##')) return <h3 key={index} className="text-base font-bold text-gray-900 mt-4 mb-2">{line.replace(/^##\s*/, '')}</h3>;
    if (line.trim() === '') return <div key={index} className="h-2" />;
    const parts = line.split('**');
    return <p key={index} className="text-sm text-gray-600 mb-1 leading-relaxed">{parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-gray-900">{part}</strong> : part)}</p>;
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

  // --- LÓGICA DE COR DA NOTA ---
  let scoreColor = "bg-gray-100 text-gray-800";
  let scoreIcon = <CheckCircle2 size={20} />;
  let scoreText = "Análise neutra.";

  if (coherenceScore >= 70) {
    scoreColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
    scoreIcon = <CheckCircle2 size={20} />;
    scoreText = `Excelente alinhamento (Nota Livo: ${coherenceScore}).`;
  } else if (coherenceScore >= 50) {
    scoreColor = "bg-yellow-50 text-yellow-700 border-yellow-100";
    scoreIcon = <Info size={20} />; 
    scoreText = `Alinhamento mediano (Nota Livo: ${coherenceScore}).`;
  } else {
    scoreColor = "bg-red-50 text-red-700 border-red-100";
    scoreIcon = <AlertTriangle size={20} />;
    scoreText = `Baixo alinhamento (Nota Livo: ${coherenceScore}).`;
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
            <ModalStockLogo ticker={stock.ticker} logoUrl={stock.logo} size="lg" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">{stock.ticker}</h2>
              <p className="text-sm text-gray-500 font-medium">{stock.name}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {stock.sector && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">{stock.sector}</span>}
                {stock.assetType === 'fii' && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">FII</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Score Card */}
          <div className={`p-4 rounded-2xl border ${scoreColor} flex gap-3`}>
            <div className="mt-0.5 shrink-0">{scoreIcon}</div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide opacity-90">Análise Livo</h3>
              <p className="text-sm mt-1 font-medium leading-snug">{scoreText}</p>
            </div>
          </div>

          {/* SEÇÃO: EVIDÊNCIAS (NOVA LÓGICA DE BÔNUS E PENALIDADES) */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ShieldAlert size={16} className="text-gray-400"/> Fatores de Impacto
            </h4>
            
            {stock.evidence_log && stock.evidence_log.length > 0 ? (
              <div className="space-y-2">
                {stock.evidence_log.map((log: any, idx: number) => {
                  // Define estilo baseado no tipo de evidência (Bônus, Penalidade ou Base)
                  let itemColor = "bg-gray-50 border-gray-100";
                  let itemIcon = <Info size={16} className="text-gray-400" />;
                  let itemValueColor = "text-gray-500";

                  if (log.type === 'BONUS') {
                    itemColor = "bg-emerald-50 border-emerald-100";
                    itemIcon = <CheckCircle2 size={16} className="text-emerald-600" />;
                    itemValueColor = "text-emerald-600";
                  } else if (log.type === 'PENALTY' || log.type === 'KILL') {
                    itemColor = "bg-red-50 border-red-100";
                    itemIcon = <AlertTriangle size={16} className="text-red-600" />;
                    itemValueColor = "text-red-600";
                  }

                  return (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${itemColor}`}>
                      <div className="flex items-center gap-3">
                         <div className="shrink-0">{itemIcon}</div>
                         <div className="flex flex-col">
                           <span className="text-sm font-bold text-gray-800 leading-tight">{log.desc}</span>
                           {log.source && <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Fonte: {log.source}</span>}
                         </div>
                      </div>
                      <div className={`text-sm font-bold ${itemValueColor} shrink-0`}>
                        {log.val > 0 ? `+${log.val}` : log.val}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Fallback para empresas sem dados detalhados (Usa tags antigas se existirem)
              <div className="space-y-2">
                 {stock.tags && stock.tags.map((tag: string) => (
                    <div key={tag} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                      <Leaf size={16} className="text-emerald-500" />
                      <span className="text-sm font-bold text-gray-700">{tag}</span>
                    </div>
                 ))}
                 {!stock.tags?.length && (
                   <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                     <p className="text-xs text-gray-400">Sem dados detalhados de impacto para este ativo.</p>
                   </div>
                 )}
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* IA Generator */}
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-600" /> Livo Intelligence
                </h3>
             </div>
             {!aiSummary && !isLoadingAi && (
               <button onClick={handleGenerateSummary} className="w-full py-3 rounded-xl border border-purple-100 bg-purple-50 text-purple-700 font-bold text-sm hover:bg-purple-100 transition-all flex items-center justify-center gap-2">
                 <Sparkles size={16} /> Gerar Resumo Inteligente
               </button>
             )}
             {isLoadingAi && (
               <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 gap-2">
                 <Loader2 size={20} className="animate-spin text-purple-500" />
                 <span className="text-xs font-bold">Gerando análise...</span>
               </div>
             )}
             {aiSummary && (
               <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-sm text-sm text-gray-700 leading-relaxed whitespace-pre-line animate-in fade-in">
                 {renderMarkdown(aiSummary)}
               </div>
             )}
          </div>

          {/* Indicadores Financeiros */}
          <div>
             <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-blue-500"/> Indicadores de Mercado</h4>
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
