import React, { useMemo, useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Plus,
  Leaf,
  Target,
  Newspaper,
  ExternalLink,
  Building2,
  ShieldCheck,
  HelpCircle,
  Search,
  CheckCircle2,
  RefreshCw,
  Zap,
  Sparkles,
  LayoutDashboard,
  BarChart3,
  Info,
  X
} from "lucide-react";

import { Holding } from "../../../types";
import { IA } from "../../../IA";

/* =======================
   INTERFACE DE NOTÍCIAS
======================= */
interface NewsItem {
  type: "capa" | "relevante" | "esg";
  title: string;
  source: string;
  impact: string;
  url: string;
}

/* =======================
   CONTEÚDO EDUCATIVO
======================= */
const STRATEGY_CONTENT = {
  fixed_income: {
    title: "Renda Fixa",
    icon: <ShieldCheck size={24} className="text-blue-600" />,
    color: "bg-blue-50 text-blue-900 border-blue-100",
    whatIs: "Empréstimo que você faz para o governo ou bancos em troca de juros. É a base da segurança.",
    why: "Sua carteira precisa de estabilidade e liquidez para reduzir riscos e formar sua reserva de emergência.",
    howToFind: "Busque por 'Tesouro Direto', 'CDB' ou 'LCI/LCA' no app da sua corretora.",
    howToDecide: "Prefira Tesouro Selic para reserva imediata ou CDBs que paguem acima de 100% do CDI para prazos maiores.",
  },
  fii: {
    title: "Fundos Imobiliários",
    icon: <Building2 size={24} className="text-orange-600" />,
    color: "bg-orange-50 text-orange-900 border-orange-100",
    whatIs: "Fundos que investem em imóveis (shoppings, galpões) ou papéis do setor. Você vira 'dono' de pedacinhos de imóveis.",
    why: "Sua carteira se beneficiaria de renda mensal passiva (aluguéis) sem a volatilidade extrema das ações.",
    howToFind: "Procure por códigos com final 11 (ex: HGLG11, KNRI11) na busca de ativos.",
    howToDecide: "Olhe a qualidade dos imóveis, quem administra o fundo e se ele paga dividendos constantes (Dividend Yield).",
  },
  stock: {
    title: "Ações",
    icon: <TrendingUp size={24} className="text-emerald-600" />,
    color: "bg-emerald-50 text-emerald-900 border-emerald-100",
    whatIs: "Menores pedaços de empresas reais. Você se torna sócio e ganha com o crescimento e lucros delas.",
    why: "Sua carteira está segura demais e precisa de potencial de crescimento a longo prazo para bater a inflação.",
    howToFind: "Procure por códigos de 4 letras seguidos de 3 (ON) ou 4 (PN) (ex: WEG3, ITUB4).",
    howToDecide: "Busque empresas lucrativas, líderes de setor e com boas notas ESG (Sustentabilidade).",
  },
};

const getCoherenceStatus = (score: number) => {
  if (score >= 80) return { color: "bg-emerald-500", text: "Excelente Equilíbrio", textClass: "text-emerald-700" };
  if (score >= 50) return { color: "bg-yellow-500", text: "Equilíbrio Moderado", textClass: "text-yellow-700" };
  return { color: "bg-red-500", text: "Precisa de Atenção", textClass: "text-red-700" };
};

/* =======================
   COMPONENT PRINCIPAL
======================= */
const HomeTab: React.FC<any> = ({
  userProfile,
  onAddTransaction,
  showValues,
  onToggleValues,
  holdings,
  rankedStocks,
}) => {
  
  // --- STATE DE NOTÍCIAS ---
  const [realNews, setRealNews] = useState<NewsItem[]>([
    {
      type: "capa",
      title: "Carregando a manchete mais importante do mercado...",
      source: "InfoMoney",
      impact: "Aguarde um momento.",
      url: "#"
    },
    {
      type: "relevante",
      title: "...",
      source: "InfoMoney",
      impact: "...",
      url: "#"
    },
    {
      type: "esg",
      title: "...",
      source: "InfoMoney",
      impact: "...",
      url: "#"
    }
  ]);
  const [loadingNews, setLoadingNews] = useState(true);

  // --- NOVO STATE: INFO BOX DA NOTA LIVO ---
  const [isLivoInfoOpen, setIsLivoInfoOpen] = useState(false);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news');
        if (!res.ok) throw new Error("API Offline");
        
        const data = await res.json();
        if (data.news && Array.isArray(data.news) && data.news.length > 0) {
          setRealNews(data.news);
        }
      } catch (error) {
        setRealNews([
           { type: "capa", title: "Ibovespa reage a cenário fiscal e juros futuros", source: "InfoMoney", impact: "Volatilidade pode gerar oportunidades.", url: "#" },
           { type: "relevante", title: "Dólar opera instável com dados dos EUA", source: "InfoMoney", impact: "Atenção a ativos dolarizados.", url: "#" },
           { type: "esg", title: "Investimento em energia limpa bate recorde no Brasil", source: "InfoMoney", impact: "Setor elétrico segue forte.", url: "#" }
        ]);
      } finally {
        setLoadingNews(false);
      }
    }
    fetchNews();
  }, []);

  /* =======================
     MÉTRICAS & CÁLCULOS
  ======================= */
  const totalBalance = holdings.reduce((acc: number, h: Holding) => acc + h.totalValue, 0);
  const totalProfit = holdings.reduce((acc: number, h: Holding) => acc + h.profit, 0);
  const totalInvested = totalBalance - totalProfit;
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const coherenceScore = useMemo(() => {
    if (totalBalance === 0) return 0;
    let weightedScoreSum = 0;
    holdings.forEach((h: Holding) => {
      // @ts-ignore
      const itemScore = h.individualScore || 50; // Usa a nota individual calculada no App.tsx
      weightedScoreSum += itemScore * h.totalValue;
    });
    return Math.round(weightedScoreSum / totalBalance);
  }, [holdings, totalBalance]);

  const coherenceStatus = getCoherenceStatus(coherenceScore);

  /* =======================
     REBALANCEAMENTO
  ======================= */
  const rebalancingStrategy = useMemo(() => {
    let target = { fixed_income: 0.4, fii: 0.3, stock: 0.3 };

    if (userProfile.riskProfile === "Personalizado" && userProfile.customTargets) {
      target = {
        fixed_income: userProfile.customTargets.fixed_income / 100,
        fii: userProfile.customTargets.fii / 100,
        stock: userProfile.customTargets.stock / 100
      };
    } 
    else if (userProfile.riskProfile === "Conservador") {
      target = { fixed_income: 0.8, fii: 0.15, stock: 0.05 };
    } 
    else if (userProfile.riskProfile === "Arrojado") {
      target = { fixed_income: 0.2, fii: 0.35, stock: 0.45 };
    }

    const currentSums = { fixed_income: 0, fii: 0, stock: 0, total: 0 };
    holdings.forEach((h: Holding) => {
      if (h.assetType === "fixed_income") currentSums.fixed_income += h.totalValue;
      else if (h.assetType === "fii") currentSums.fii += h.totalValue;
      else currentSums.stock += h.totalValue;
      currentSums.total += h.totalValue;
    });
    
    const totalCalc = currentSums.total || 1;
    const current = { fixed_income: currentSums.fixed_income / totalCalc, fii: currentSums.fii / totalCalc, stock: currentSums.stock / totalCalc };
    const gaps = { fixed_income: target.fixed_income - current.fixed_income, fii: target.fii - current.fii, stock: target.stock - current.stock };
    
    let focus: "fixed_income" | "fii" | "stock" = "fixed_income";
    let maxGap = -Infinity;
    (Object.keys(gaps) as Array<keyof typeof gaps>).forEach((key) => {
      if (gaps[key] > maxGap) { maxGap = gaps[key]; focus = key; }
    });
    
    return { key: focus, content: STRATEGY_CONTENT[focus] };
  }, [holdings, userProfile]);

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="space-y-6 pb-32 animate-in fade-in">
      
      {/* 1. SE CARTEIRA VAZIA: MOSTRA BOX DE "START" */}
      {totalBalance === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-emerald-50 rounded-full w-32 h-32 blur-2xl opacity-50"></div>

           <div className="relative z-10">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                 <Sparkles size={24} />
               </div>
               <h2 className="text-xl font-bold text-gray-900">Vamos começar sua jornada?</h2>
             </div>

             <p className="text-gray-600 leading-relaxed mb-6">
               Você ainda não tem investimentos adicionados à Livo. Verifique a <strong>estratégia abaixo</strong> indicada para seu perfil, comece a investir por meio de seu banco ou corretora de preferência e lance seus investimentos aqui.
             </p>

             <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Com investimentos cadastrados você desbloqueia:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Zap size={16} className="text-amber-500"/> Análises automáticas da <strong>Livo AI</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-blue-500"/> Gráficos personalizados de alocação
                  </li>
                  <li className="flex items-center gap-2">
                    <LayoutDashboard size={16} className="text-emerald-500"/> Insights de rebalanceamento
                  </li>
                </ul>
             </div>

             <button 
               onClick={onAddTransaction}
               className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all"
             >
               <Plus size={20} /> Lançar meu primeiro investimento
             </button>
           </div>
        </div>
      ) : (
        /* SE TEM SALDO: MOSTRA PATRIMÔNIO NORMAL */
        <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <Leaf size={200} />
          </div>
          <p className="text-emerald-100 text-sm font-medium">Patrimônio Total</p>
          <div className="flex items-center gap-3 mt-1 relative z-10">
            <h2 className="text-4xl font-bold tracking-tight">
              {showValues ? `R$ ${totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "••••••••"}
            </h2>
            <button onClick={onToggleValues} className="opacity-80 hover:opacity-100 transition-opacity">
              {showValues ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {totalBalance > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm font-bold text-emerald-300">
              {totalProfit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>
                {showValues ? (<>R$ {Math.abs(totalProfit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({profitPercentage.toFixed(2)}%)</>) : "••••"}
              </span>
            </div>
          )}
          <button onClick={onAddTransaction} className="mt-6 w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/20">
            <Plus size={20} /> Novo Aporte
          </button>
        </div>
      )}

      {/* 2. IA (APENAS SE TIVER SALDO) - MANTIDO INTACTO */}
      {totalBalance > 0 && <IA carteira={holdings} />}

      {/* 3. NOTA LIVO DA CARTEIRA (ALTERADO CONFORME PEDIDO) */}
      {totalBalance > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" size={20} />
                Nota Livo da Carteira
              </h3>
              
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500">Alinhamento com seu perfil</p>
                <button 
                   onClick={() => setIsLivoInfoOpen(!isLivoInfoOpen)}
                   className="text-gray-400 hover:text-emerald-600 transition-colors"
                >
                   <Info size={14} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="font-bold text-3xl text-gray-900">{coherenceScore}</span>
            </div>
          </div>

          {/* BOX DE INFO EXPANSÍVEL (NOVO) */}
          {isLivoInfoOpen && (
             <div className="mb-4 bg-emerald-50 rounded-xl p-4 border border-emerald-100 animate-in fade-in slide-in-from-top-2 relative">
                <button 
                  onClick={() => setIsLivoInfoOpen(false)}
                  className="absolute top-2 right-2 text-emerald-700/50 hover:text-emerald-700"
                >
                  <X size={16} />
                </button>
                <p className="text-sm text-emerald-900 leading-relaxed font-medium">
                  Este índice revela o nível de coerência dos seus investimentos. Calculamos uma média ponderada cruzando a <strong>Nota Livo</strong> de cada ativo (Financeiro + ESG) com a <strong>quantidade de dinheiro</strong> que você tem alocado neles. Quanto maior a nota, mais fiel sua carteira está aos seus objetivos de retorno e impacto.
                </p>
             </div>
          )}

          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div className={`absolute top-0 left-0 h-full ${coherenceStatus.color} transition-all duration-1000 ease-out`} style={{ width: `${coherenceScore}%` }} />
          </div>
          <div className="flex justify-between items-center text-xs font-medium">
              <span className={`${coherenceStatus.textClass} font-bold`}>{coherenceStatus.text}</span>
              <span className="text-gray-400">Meta: 100</span>
          </div>
        </div>
      )}

      {/* 4. INSIGHTS + ESTRATÉGIA - MANTIDO INTACTO */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-emerald-600" size={20} />
            <h3 className="font-bold text-lg text-gray-900">Insights Conscientes</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Com base no seu perfil <strong>{userProfile.riskProfile}</strong>, identificamos onde você deve focar seus próximos investimentos.
          </p>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estratégia do Mês</span>
            <div className="flex items-center gap-3 mt-2">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center ${rebalancingStrategy.content.color.split(' ')[0]} ${rebalancingStrategy.content.color.split(' ')[1]}`}>
                 {rebalancingStrategy.content.icon}
               </div>
               <div>
                 <p className="text-sm text-gray-500">Foco recomendado em:</p>
                 <h4 className="text-xl font-bold text-gray-900 leading-tight">{rebalancingStrategy.content.title}</h4>
               </div>
            </div>
          </div>
          <div className="space-y-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <div className="flex gap-3 items-start">
              <HelpCircle className="text-gray-400 mt-0.5 shrink-0" size={16} />
              <div><p className="text-xs font-bold text-gray-700 uppercase mb-1">O que são?</p><p className="text-sm text-gray-600 leading-relaxed">{rebalancingStrategy.content.whatIs}</p></div>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={16} />
              <div><p className="text-xs font-bold text-gray-700 uppercase mb-1">Por que faz sentido agora?</p><p className="text-sm text-gray-600 leading-relaxed">{rebalancingStrategy.content.why}</p></div>
            </div>
             <div className="flex gap-3 items-start">
              <Search className="text-blue-400 mt-0.5 shrink-0" size={16} />
              <div><p className="text-xs font-bold text-gray-700 uppercase mb-1">Como encontrar?</p><p className="text-sm text-gray-600 leading-relaxed">{rebalancingStrategy.content.howToFind}</p></div>
            </div>
             <div className="flex gap-3 items-start">
              <Target className="text-orange-400 mt-0.5 shrink-0" size={16} />
              <div><p className="text-xs font-bold text-gray-700 uppercase mb-1">Como decidir?</p><p className="text-sm text-gray-600 leading-relaxed">{rebalancingStrategy.content.howToDecide}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. NOTÍCIAS - MANTIDO INTACTO */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="text-emerald-500" />
            <h3 className="font-bold text-gray-900">Radar de Mercado</h3>
          </div>
          <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Ao Vivo
          </span>
        </div>

        {loadingNews && (
          <div className="space-y-4 opacity-50">
             <div className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
             <div className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
             <div className="flex items-center gap-2 text-sm text-gray-400 justify-center mt-4">
               <RefreshCw className="animate-spin" size={16}/> Sintonizando InfoMoney...
             </div>
          </div>
        )}

        {!loadingNews && realNews.length > 0 && (
          <div className="flex flex-col gap-4">
            
            {realNews[0] && (
              <a 
                href={realNews[0].url} 
                target="_blank" 
                rel="noreferrer"
                className="group relative block bg-gray-900 rounded-2xl p-6 text-white overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
              >
                <div className="absolute top-0 right-0 p-8 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-3">
                     <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                       <Zap size={10} fill="currentColor" /> Manchete do Dia
                     </span>
                     <span className="text-gray-400 text-xs uppercase font-medium">{realNews[0].source}</span>
                   </div>
                   
                   <h4 className="text-xl font-bold leading-tight mb-2 group-hover:text-emerald-300 transition-colors">
                     {realNews[0].title}
                   </h4>
                   
                   <p className="text-sm text-gray-300 line-clamp-2">
                     {realNews[0].impact}
                   </p>
                </div>
              </a>
            )}

            <div className="grid gap-3">
              {realNews.slice(1).map((news, idx) => (
                <a
                  key={idx}
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block p-4 rounded-2xl border transition-all cursor-pointer group ${
                    news.type === 'esg' 
                      ? 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50' 
                      : 'bg-gray-50 border-transparent hover:border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <p className="font-bold text-sm text-gray-800 leading-snug group-hover:text-gray-900">
                      {news.title}
                    </p>
                    <ExternalLink size={14} className="text-gray-300 group-hover:text-gray-500 shrink-0 mt-1" />
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    💡 {news.impact}
                  </p>

                  <div className="flex justify-between items-center mt-3 text-[10px] uppercase font-bold tracking-wider">
                    <span className="text-gray-400">{news.source}</span>
                    
                    {news.type === 'esg' && (
                      <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        <Leaf size={10} /> Destaque ESG
                      </span>
                    )}
                    {news.type === 'relevante' && (
                      <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        Em Alta
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default HomeTab;
