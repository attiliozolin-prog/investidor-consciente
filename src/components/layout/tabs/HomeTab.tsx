import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PieChart,
  Leaf,
  AlertCircle,
  TrendingUp,
  Info,
  ShieldCheck,
  Sparkles,
  Newspaper,
  Zap,
  Loader2,
  ExternalLink
} from "lucide-react";
import { UserProfile, Transaction, Holding } from "../../../types";

// Mock de Notícias (Para garantir que não fique vazio enquanto a API conecta)
const MOCK_NEWS = [
  { id: 1, title: "Ibovespa fecha em alta impulsionado por Vale e Petrobras", source: "InfoMoney", time: "15 min atrás" },
  { id: 2, title: "Dólar recua com dados de inflação nos EUA abaixo do esperado", source: "Investing.com", time: "1h atrás" },
  { id: 3, title: "Setor de Energia lidera ganhos com foco em dividendos", source: "Brazil Journal", time: "3h atrás" },
];

interface HomeTabProps {
  userProfile: UserProfile;
  transactions: Transaction[];
  onAddTransaction: () => void;
  showValues: boolean;
  onToggleValues: () => void;
  holdings: Holding[];
  rankedStocks: any[];
}

export default function HomeTab({
  userProfile,
  transactions,
  onAddTransaction,
  showValues,
  onToggleValues,
  holdings,
  rankedStocks,
}: HomeTabProps) {
  
  // --- 1. LÓGICA FINANCEIRA & NOTA ---
  const totalPortfolioValue = holdings.reduce((acc, h) => acc + h.totalValue, 0);
  
  const portfolioScore = useMemo(() => {
    if (totalPortfolioValue === 0) return 0;
    const totalWeightedScore = holdings.reduce((acc, h) => {
      // @ts-ignore
      const itemScore = h.individualScore || 50; 
      return acc + (itemScore * h.totalValue);
    }, 0);
    return Math.round(totalWeightedScore / totalPortfolioValue);
  }, [holdings, totalPortfolioValue]);

  let scoreColor = "text-gray-400";
  let scoreBg = "bg-gray-100";
  let scoreLabel = "Neutro";

  if (portfolioScore >= 75) {
    scoreColor = "text-emerald-600";
    scoreBg = "bg-emerald-100";
    scoreLabel = "Excelente";
  } else if (portfolioScore >= 60) {
    scoreColor = "text-emerald-500";
    scoreBg = "bg-emerald-50";
    scoreLabel = "Bom";
  } else if (portfolioScore >= 40) {
    scoreColor = "text-orange-500";
    scoreBg = "bg-orange-50";
    scoreLabel = "Atenção";
  } else if (portfolioScore > 0) {
    scoreColor = "text-red-500";
    scoreBg = "bg-red-50";
    scoreLabel = "Crítico";
  }

  const totalInvested = transactions.reduce((acc, t) => {
    return t.type === "BUY" ? acc + t.quantity * t.price : acc - t.quantity * t.price;
  }, 0);
  
  const profit = totalPortfolioValue - totalInvested;
  const profitPercent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

  // --- 2. LIVO INTELLIGENCE (LÓGICA RESTAURADA) ---
  const [aiTab, setAiTab] = useState<"ANALYSIS" | "NEWS">("ANALYSIS");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Simula a geração de IA para a carteira
  const handleGeneratePortfolioAnalysis = () => {
    setIsGeneratingAi(true);
    // Aqui conectaríamos com /api/summarize-portfolio no futuro
    setTimeout(() => {
      const topAsset = holdings.sort((a,b) => b.totalValue - a.totalValue)[0]?.ticker || "sua carteira";
      setAiAnalysis(`**Análise Livo:** Sua carteira apresenta uma pontuação **${scoreLabel}** (${portfolioScore}/100).\n\nDetectamos uma concentração relevante em **${topAsset}**, o que impulsiona seus resultados hoje. O mercado segue volátil, mas sua exposição a ativos de valor (Value Investing) protege seu patrimônio.`);
      setIsGeneratingAi(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in">
      
      {/* 1. CARD PATRIMÔNIO */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="p-2 bg-gray-100 rounded-full">
              <Wallet size={18} />
            </div>
            <span className="text-sm font-medium">Patrimônio Total</span>
          </div>
          <button onClick={onToggleValues} className="text-xs text-gray-400 font-bold uppercase tracking-wider hover:text-emerald-600 transition-colors">
            {showValues ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {showValues
              ? `R$ ${totalPortfolioValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              : "R$ •••••••"}
          </h2>
          
          {showValues && (
            <div className={`flex items-center gap-1 text-sm font-bold ${profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {profit >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>
                R$ {Math.abs(profit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({profitPercent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
           <button onClick={onAddTransaction} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
             <TrendingUp size={18} /> Novo Aporte
           </button>
           <button className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
             Ver Extrato
           </button>
        </div>
      </div>

      {/* 2. CARD NOTA LIVO (ATUALIZADO) */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 ${scoreBg} rounded-bl-full opacity-50 pointer-events-none`} />
        <div className="relative z-10">
          <div className="flex justify-between items-start">
             <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={20} className={scoreColor} />
                  Nota Livo da Carteira
                </h3>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1">
                  Alinhamento com seu perfil
                </p>
             </div>
             <div className="text-right">
                <div className={`text-4xl font-black ${scoreColor}`}>
                  {portfolioScore > 0 ? portfolioScore : "--"}
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block mt-1 ${scoreBg} ${scoreColor}`}>
                  {scoreLabel}
                </div>
             </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-600 leading-relaxed">
              Este índice revela a coerência da sua carteira. Cruzamos a <strong>Nota Livo</strong> de cada ativo (Financeiro + ESG) com o <strong>peso financeiro</strong> que ele tem no seu bolso.
            </p>
          </div>
        </div>
      </div>

      {/* 3. LIVO INTELLIGENCE (RESTAURADO) */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
        {/* Efeitos de Fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
              <Sparkles size={20} className="text-yellow-300" />
              Livo Intelligence
            </h3>
            <div className="flex bg-white/10 p-1 rounded-lg backdrop-blur-md">
              <button 
                onClick={() => setAiTab("ANALYSIS")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${aiTab === "ANALYSIS" ? "bg-white text-indigo-900" : "text-white/60 hover:text-white"}`}
              >
                Análise
              </button>
              <button 
                onClick={() => setAiTab("NEWS")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${aiTab === "NEWS" ? "bg-white text-indigo-900" : "text-white/60 hover:text-white"}`}
              >
                Notícias
              </button>
            </div>
          </div>

          <div className="min-h-[140px]">
            {aiTab === "ANALYSIS" ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                 {!aiAnalysis && !isGeneratingAi && (
                   <div className="text-center py-4">
                     <p className="text-white/80 text-sm mb-4">
                       Nossa IA analisa sua carteira, o fechamento do mercado e as notícias de hoje para te dar um resumo personalizado.
                     </p>
                     <button 
                       onClick={handleGeneratePortfolioAnalysis}
                       className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 mx-auto"
                     >
                       <Zap size={16} fill="currentColor" /> Gerar Análise Diária
                     </button>
                   </div>
                 )}

                 {isGeneratingAi && (
                   <div className="flex flex-col items-center justify-center py-6 text-white/70">
                     <Loader2 size={32} className="animate-spin mb-2" />
                     <span className="text-xs font-bold uppercase tracking-wider">Lendo o mercado...</span>
                   </div>
                 )}

                 {aiAnalysis && (
                   <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                     <div className="text-sm leading-relaxed text-white/90 whitespace-pre-line">
                       {aiAnalysis}
                     </div>
                   </div>
                 )}
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                {MOCK_NEWS.map((news) => (
                  <div key={news.id} className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10 hover:bg-white/20 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start gap-3">
                       <h4 className="text-sm font-medium text-white group-hover:text-yellow-200 transition-colors line-clamp-2">
                         {news.title}
                       </h4>
                       <ExternalLink size={14} className="text-white/40 shrink-0 mt-1" />
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-white/50 uppercase font-bold tracking-wider">
                      <span>{news.source}</span>
                      <span>•</span>
                      <span>{news.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. DIVERSIFICAÇÃO */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <PieChart size={20} className="text-gray-400" />
          Diversificação
        </h3>
        {holdings.length > 0 ? (
          <div className="space-y-4">
             {holdings.slice(0, 4).map(h => (
               <div key={h.ticker} className="space-y-1">
                 <div className="flex justify-between text-sm">
                   <span className="font-bold text-gray-700">{h.ticker}</span>
                   <span className="text-gray-500">{((h.totalValue / totalPortfolioValue) * 100).toFixed(1)}%</span>
                 </div>
                 <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(h.totalValue / totalPortfolioValue) * 100}%` }} />
                 </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">
            Nenhum dado para exibir.
          </div>
        )}
      </div>

    </div>
  );
}
