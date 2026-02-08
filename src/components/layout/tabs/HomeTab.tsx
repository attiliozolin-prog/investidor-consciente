import React, { useMemo, useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Wallet, PieChart, Leaf, TrendingUp, ShieldCheck, Sparkles, Zap, Loader2, Newspaper, Globe, ArrowRight, Info, X } from "lucide-react";
import { UserProfile, Transaction, Holding } from "../../../types";

const renderMarkdown = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, index) => {
    if (!line.trim()) return <br key={index} />;
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={index} className="mb-2 text-gray-700 leading-relaxed">
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    );
  });
};

interface NewsItem { type: 'capa' | 'relevante' | 'esg'; title: string; source: string; impact: string; url: string; }
interface HomeTabProps { userProfile: UserProfile; transactions: Transaction[]; onAddTransaction: () => void; showValues: boolean; onToggleValues: () => void; holdings: Holding[]; rankedStocks: any[]; }

export default function HomeTab({ userProfile, transactions, onAddTransaction, showValues, onToggleValues, holdings, rankedStocks }: HomeTabProps) {
  
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
    scoreColor = "text-emerald-600"; scoreBg = "bg-emerald-100"; scoreLabel = "Excelente";
  } else if (portfolioScore >= 60) {
    scoreColor = "text-emerald-500"; scoreBg = "bg-emerald-50"; scoreLabel = "Bom";
  } else if (portfolioScore >= 40) {
    scoreColor = "text-orange-500"; scoreBg = "bg-orange-50"; scoreLabel = "Atenção";
  } else if (portfolioScore > 0) {
    scoreColor = "text-red-500"; scoreBg = "bg-red-50"; scoreLabel = "Crítico";
  }

  const totalInvested = transactions.reduce((acc, t) => t.type === "BUY" ? acc + t.quantity * t.price : acc - t.quantity * t.price, 0);
  const profit = totalPortfolioValue - totalInvested;
  const profitPercent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const handleGeneratePortfolioAnalysis = async () => {
    setIsGeneratingAi(true); setAiAnalysis(null);
    try {
      const response = await fetch('/api/consultor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carteira: { total: totalPortfolioValue, notaGeral: portfolioScore, perfilUsuario: userProfile.riskProfile || "Moderado", ativos: holdings.map(h => ({ ativo: h.ticker, valor: h.totalValue })) } })
      });
      const data = await response.json();
      if (data.resultado) setAiAnalysis(data.resultado); else throw new Error("Sem resposta");
    } catch (error) { setAiAnalysis("**Ops!** A Livo teve um pequeno soluço. Tente novamente."); } finally { setIsGeneratingAi(false); }
  };

  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  useEffect(() => {
    fetch('/api/news').then(res => res.json()).then(data => { if (data.news && Array.isArray(data.news)) setNewsData(data.news); }).finally(() => setIsLoadingNews(false));
  }, []);

  const capaNews = newsData.find(n => n.type === 'capa') || { title: "Carregando destaques...", source: "InfoMoney", impact: "Aguarde um momento.", url: "#", type: 'capa' };
  const esgNews = newsData.find(n => n.type === 'esg') || { title: "Buscando destaques...", source: "Livo ESG", impact: "Analisando impacto.", url: "#", type: 'esg' };
  const [isLivoInfoOpen, setIsLivoInfoOpen] = useState(false);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 text-gray-500"><div className="p-2 bg-gray-100 rounded-full"><Wallet size={18} /></div><span className="text-sm font-medium">Patrimônio Total</span></div>
          <button onClick={onToggleValues} className="text-xs text-gray-400 font-bold uppercase tracking-wider hover:text-emerald-600 transition-colors">{showValues ? "Ocultar" : "Mostrar"}</button>
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{showValues ? `R$ ${totalPortfolioValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ •••••••"}</h2>
          {showValues && ( <div className={`flex items-center gap-1 text-sm font-bold ${profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>{profit >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}<span>R$ {Math.abs(profit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({profitPercent.toFixed(2)}%)</span></div> )}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
           <button onClick={onAddTransaction} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"><TrendingUp size={18} /> Novo Aporte</button>
           <button className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">Ver Extrato</button>
        </div>
      </div>

      {totalPortfolioValue > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><ShieldCheck className={scoreColor} size={20} /> Nota Livo da Carteira</h3>
              <div className="flex items-center gap-2 mt-1"><p className="text-xs text-gray-500">Alinhamento com seu perfil</p><button onClick={() => setIsLivoInfoOpen(!isLivoInfoOpen)} className="text-gray-400 hover:text-emerald-600 transition-colors"><Info size={14} /></button></div>
            </div>
            <div className="flex flex-col items-end"><span className={`font-bold text-3xl ${scoreColor}`}>{portfolioScore}</span></div>
          </div>
          {isLivoInfoOpen && (
             <div className="mb-4 bg-blue-50 rounded-xl p-4 border border-blue-100 animate-in fade-in slide-in-from-top-2 relative">
                <button onClick={() => setIsLivoInfoOpen(false)} className="absolute top-2 right-2 text-blue-700/50 hover:text-blue-700"><X size={16} /></button>
                {/* --- TEXTO CORRIGIDO AQUI --- */}
                <p className="text-sm text-blue-900 leading-relaxed font-medium">
                  Este índice revela a <strong>integridade média</strong> da sua carteira. Calculamos uma média ponderada cruzando a <strong>Nota Livo</strong> de cada ativo (Baseada em selos de sustentabilidade e histórico de conduta) com o <strong>volume financeiro</strong> que você tem alocado neles.
                </p>
             </div>
          )}
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${portfolioScore >= 60 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${portfolioScore}%` }} />
          </div>
          <div className="flex justify-between items-center text-xs font-medium"><span className={`${scoreColor} font-bold`}>{scoreLabel}</span><span className="text-gray-400">Meta: 100</span></div>
        </div>
      )}

      {totalPortfolioValue > 0 && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900"><Sparkles size={20} className="text-purple-600" /> Livo Intelligence</h3>
              {!aiAnalysis && !isGeneratingAi && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-bold uppercase">Beta</span>}
           </div>
           {!aiAnalysis && !isGeneratingAi && (
              <button onClick={handleGeneratePortfolioAnalysis} className="w-full py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl text-purple-700 font-bold text-sm hover:from-purple-100 hover:to-indigo-100 transition-all flex flex-col items-center justify-center gap-1 group">
                <div className="flex items-center gap-2"><Zap size={18} className="group-hover:scale-110 transition-transform" /> Gerar Análise da Carteira</div>
                <span className="text-[10px] text-purple-400 font-normal">Baseada em IA e notícias do dia</span>
              </button>
           )}
           {isGeneratingAi && (
              <div className="flex flex-col items-center justify-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200"><Loader2 size={24} className="animate-spin mb-2 text-purple-500" /><span className="text-xs font-bold uppercase tracking-wider">Processando dados...</span></div>
           )}
           {aiAnalysis && <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-sm text-gray-700 leading-relaxed whitespace-pre-line animate-in fade-in">{renderMarkdown(aiAnalysis)}</div>}
        </div>
      )}

      <div>
         <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 px-2"><Globe size={20} className="text-gray-400" /> Giro do Mercado</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <a href={capaNews.url} target="_blank" rel="noopener noreferrer" className={`bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-300 transition-all group block relative ${isLoadingNews ? 'animate-pulse' : ''}`}>
              <div className="flex justify-between items-start mb-3"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Newspaper size={20} /></div><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destaque do Dia</span></div>
              <h4 className="font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-700 transition-colors line-clamp-3">{capaNews.title}</h4>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{capaNews.impact}</p>
              <div className="flex items-center justify-between text-xs text-gray-400"><span className="font-bold text-blue-600">{capaNews.source}</span><ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-blue-400"/></div>
           </a>
           <a href={esgNews.url} target="_blank" rel="noopener noreferrer" className={`bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:border-emerald-300 transition-all group block relative ${isLoadingNews ? 'animate-pulse' : ''}`}>
              <div className="flex justify-between items-start mb-3"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Leaf size={20} /></div><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destaque ESG</span></div>
              <h4 className="font-bold text-gray-900 leading-tight mb-2 group-hover:text-emerald-700 transition-colors line-clamp-3">{esgNews.title}</h4>
               <p className="text-xs text-gray-500 mb-3 line-clamp-2">{esgNews.impact}</p>
              <div className="flex items-center justify-between text-xs text-gray-400"><span className="font-bold text-emerald-600">{esgNews.source}</span><ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-emerald-400"/></div>
           </a>
         </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4"><PieChart size={20} className="text-gray-400" /> Diversificação</h3>
        {holdings.length > 0 ? (
          <div className="space-y-4">
             {holdings.slice(0, 4).map(h => (
               <div key={h.ticker} className="space-y-1">
                 <div className="flex justify-between text-sm"><span className="font-bold text-gray-700">{h.ticker}</span><span className="text-gray-500">{((h.totalValue / totalPortfolioValue) * 100).toFixed(1)}%</span></div>
                 <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(h.totalValue / totalPortfolioValue) * 100}%` }}/></div>
               </div>
             ))}
          </div>
        ) : (<div className="text-center py-8 text-gray-400 text-sm">Nenhum dado para exibir.</div>)}
      </div>
    </div>
  );
}
