import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PieChart,
  Leaf,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Zap,
  Loader2,
  ExternalLink,
  Newspaper,
  Globe,
  ArrowRight
} from "lucide-react";
import { UserProfile, Transaction, Holding } from "../../../types";

// Interface para as notícias que vêm da API
interface NewsItem {
  type: 'capa' | 'relevante' | 'esg';
  title: string;
  source: string;
  impact: string;
  url: string;
}

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
  
  // --- 1. LÓGICA FINANCEIRA ---
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

  // --- 2. IA ANALYTICS (BOTÃO SEPARADO) ---
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleGeneratePortfolioAnalysis = () => {
    setIsGeneratingAi(true);
    // Simulação da IA da Carteira (Futuro: conectar com backend)
    setTimeout(() => {
      const topAsset = holdings.sort((a,b) => b.totalValue - a.totalValue)[0]?.ticker || "sua carteira";
      setAiAnalysis(`**Resumo Livo:** Sua carteira tem nota **${portfolioScore}** (${scoreLabel}).\n\nIdentificamos concentração em **${topAsset}**. O cenário atual favorece sua estratégia de longo prazo, mas fique atento à volatilidade de curto prazo.`);
      setIsGeneratingAi(false);
    }, 2000);
  };

  // --- 3. NOTÍCIAS REAIS (CONEXÃO COM API/NEWS.JS) ---
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news');
        const data = await res.json();
        if (data.news && Array.isArray(data.news)) {
          setNewsData(data.news);
        }
      } catch (error) {
        console.error("Erro ao carregar notícias:", error);
      } finally {
        setIsLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  // Filtra as notícias para os boxes
  const capaNews = newsData.find(n => n.type === 'capa') || {
    title: "Carregando destaques do mercado...",
    source: "InfoMoney",
    impact: "Aguarde um momento.",
    url: "#",
    type: 'capa'
  };

  const esgNews = newsData.find(n => n.type === 'esg') || {
    title: "Buscando destaques sustentáveis...",
    source: "Livo ESG",
    impact: "Analisando impacto.",
    url: "#",
    type: 'esg'
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in">
      
      {/* 1. PATRIMÔNIO */}
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

      {/* 2. NOTA LIVO */}
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

      {/* 3. LIVO INTELLIGENCE (BOTÃO ISOLADO) */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
             <Sparkles size={20} className="text-purple-600" />
             Livo Intelligence
           </h3>
           {!aiAnalysis && !isGeneratingAi && (
             <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-bold uppercase">
               Beta
             </span>
           )}
        </div>

        {!aiAnalysis && !isGeneratingAi && (
           <button 
             onClick={handleGeneratePortfolioAnalysis}
             className="w-full py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl text-purple-700 font-bold text-sm hover:from-purple-100 hover:to-indigo-100 transition-all flex flex-col items-center justify-center gap-1 group"
           >
             <div className="flex items-center gap-2">
               <Zap size={18} className="group-hover:scale-110 transition-transform" />
               Gerar Análise da Carteira
             </div>
             <span className="text-[10px] text-purple-400 font-normal">Baseada em IA e notícias do dia</span>
           </button>
        )}

        {isGeneratingAi && (
           <div className="flex flex-col items-center justify-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
             <Loader2 size={24} className="animate-spin mb-2 text-purple-500" />
             <span className="text-xs font-bold uppercase tracking-wider">Processando dados...</span>
           </div>
        )}

        {aiAnalysis && (
           <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-sm text-gray-700 leading-relaxed whitespace-pre-line animate-in fade-in">
             {aiAnalysis}
           </div>
        )}
      </div>

      {/* 4. GIRO DO MERCADO (REAL-TIME VIA API) */}
      <div>
         <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 px-2">
           <Globe size={20} className="text-gray-400" />
           Giro do Mercado
         </h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* BOX 1: DESTAQUE DO DIA (CAPA) */}
           <a 
             href={capaNews.url} 
             target="_blank" 
             rel="noopener noreferrer"
             className={`bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-300 transition-all group block relative ${isLoadingNews ? 'animate-pulse' : ''}`}
           >
              <div className="flex justify-between items-start mb-3">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Newspaper size={20} />
                 </div>
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destaque do Dia</span>
              </div>
              <h4 className="font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-700 transition-colors line-clamp-3">
                 {capaNews.title}
              </h4>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                 {capaNews.impact}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                 <span className="font-bold text-blue-600">{capaNews.source}</span>
                 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-blue-400"/>
              </div>
           </a>

           {/* BOX 2: DESTAQUE ESG (VERDE) */}
           <a 
             href={esgNews.url} 
             target="_blank" 
             rel="noopener noreferrer"
             className={`bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:border-emerald-300 transition-all group block relative ${isLoadingNews ? 'animate-pulse' : ''}`}
           >
              <div className="flex justify-between items-start mb-3">
                 <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Leaf size={20} />
                 </div>
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destaque ESG</span>
              </div>
              <h4 className="font-bold text-gray-900 leading-tight mb-2 group-hover:text-emerald-700 transition-colors line-clamp-3">
                 {esgNews.title}
              </h4>
               <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                 {esgNews.impact}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                 <span className="font-bold text-emerald-600">{esgNews.source}</span>
                 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-emerald-400"/>
              </div>
           </a>
         </div>
      </div>

      {/* 5. DIVERSIFICAÇÃO */}
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
                   <div 
                     className="h-full bg-emerald-500 rounded-full" 
                     style={{ width: `${(h.totalValue / totalPortfolioValue) * 100}%` }}
                   />
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
