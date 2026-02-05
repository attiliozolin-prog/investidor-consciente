import React, { useMemo } from "react";
import {
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Plus,
  Leaf,
  Sprout,
  TreeDeciduous,
  Target,
  Newspaper,
  ExternalLink,
  Building2,
  ShieldCheck,
  HelpCircle,
  Search,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { Holding } from "../../../types";
import { IA } from "../../../IA";

/* =======================
   MOCK NEWS (local)
======================= */
const MOCK_NEWS = [
  {
    title: "Mercado segue atento às decisões de juros no Brasil.",
    source: "InfoMoney",
    url: "#",
  },
  {
    title: "Investimentos sustentáveis ganham força em 2025.",
    source: "Valor Econômico",
    url: "#",
  },
];

/* =======================
   CONTEÚDO EDUCATIVO (ESTRATÉGIA)
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

/* =======================
   HELPER: COERÊNCIA (STATUS)
======================= */
const getCoherenceStatus = (score: number) => {
  if (score >= 80) return { color: "bg-emerald-500", text: "Excelente Equilíbrio", textClass: "text-emerald-700" };
  if (score >= 50) return { color: "bg-yellow-500", text: "Equilíbrio Moderado", textClass: "text-yellow-700" };
  return { color: "bg-red-500", text: "Precisa de Atenção", textClass: "text-red-700" };
};

/* =======================
   COMPONENT
======================= */
const HomeTab: React.FC<any> = ({
  userProfile,
  onAddTransaction,
  showValues,
  onToggleValues,
  holdings,
  rankedStocks,
}) => {
  /* =======================
     MÉTRICAS GERAIS
  ======================= */
  const totalBalance = holdings.reduce(
    (acc: number, h: Holding) => acc + h.totalValue,
    0
  );

  const totalProfit = holdings.reduce(
    (acc: number, h: Holding) => acc + h.profit,
    0
  );

  const totalInvested = totalBalance - totalProfit;
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  /* =======================
     COERÊNCIA
  ======================= */
  const coherenceScore = useMemo(() => {
    if (totalBalance === 0) return 0;
    let weightedScoreSum = 0;
    holdings.forEach((h: Holding) => {
      const stockRank = rankedStocks.find((r: any) => r.ticker === h.ticker);
      const score = stockRank ? stockRank.coherenceScore : 50;
      weightedScoreSum += score * h.totalValue;
    });
    return Math.round(weightedScoreSum / totalBalance);
  }, [holdings, rankedStocks, totalBalance]);

  const coherenceStatus = getCoherenceStatus(coherenceScore);

  /* =======================
     REBALANCEAMENTO
  ======================= */
  const rebalancingStrategy = useMemo(() => {
    const target = { fixed_income: 0.3, fii: 0.4, stock: 0.3 };

    if (userProfile.riskProfile === "Conservador") {
      target.fixed_income = 0.6; target.fii = 0.2; target.stock = 0.2;
    } else if (userProfile.riskProfile === "Arrojado") {
      target.fixed_income = 0.1; target.fii = 0.4; target.stock = 0.5;
    }

    const currentSums = { fixed_income: 0, fii: 0, stock: 0, total: 0 };
    holdings.forEach((h: Holding) => {
      if (h.assetType === "fixed_income") currentSums.fixed_income += h.totalValue;
      else if (h.assetType === "fii") currentSums.fii += h.totalValue;
      else currentSums.stock += h.totalValue;
      currentSums.total += h.totalValue;
    });

    const totalCalc = currentSums.total || 1;
    const current = {
      fixed_income: currentSums.fixed_income / totalCalc,
      fii: currentSums.fii / totalCalc,
      stock: currentSums.stock / totalCalc,
    };

    const gaps = {
      fixed_income: target.fixed_income - current.fixed_income,
      fii: target.fii - current.fii,
      stock: target.stock - current.stock,
    };

    let focus: "fixed_income" | "fii" | "stock" = "fixed_income";
    let maxGap = -Infinity;

    (Object.keys(gaps) as Array<keyof typeof gaps>).forEach((key) => {
      if (gaps[key] > maxGap) {
        maxGap = gaps[key];
        focus = key;
      }
    });

    return { 
      key: focus,
      content: STRATEGY_CONTENT[focus] 
    };
  }, [holdings, userProfile]);

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="space-y-6 pb-32 animate-in fade-in">
      {/* 1. PATRIMÔNIO (MANTIDO) */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Leaf size={200} />
        </div>
        <p className="text-emerald-100 text-sm font-medium">Patrimônio Total</p>
        <div className="flex items-center gap-3 mt-1 relative z-10">
          <h2 className="text-4xl font-bold tracking-tight">
            {showValues
              ? `R$ ${totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              : "••••••••"}
          </h2>
          <button onClick={onToggleValues} className="opacity-80 hover:opacity-100 transition-opacity">
            {showValues ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {totalBalance > 0 && (
          <div className="mt-2 flex items-center gap-2 text-sm font-bold text-emerald-300">
            {totalProfit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>
              {showValues ? (
                 <>R$ {Math.abs(totalProfit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({profitPercentage.toFixed(2)}%)</>
              ) : "••••"}
            </span>
          </div>
        )}
        <button
          onClick={onAddTransaction}
          className="mt-6 w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"
        >
          <Plus size={20} /> Novo Aporte
        </button>
      </div>

      {/* 2. IA (MANTIDO) */}
      {totalBalance > 0 && <IA carteira={holdings} />}

      {/* 3. JARDIM CONSCIENTE (VERSÃO NOVA COM BARRA DE CORES) */}
      {totalBalance > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Leaf className="text-emerald-600" size={20} />
                Jardim Consciente
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Alinhamento com seus valores ({userProfile.riskProfile})
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-bold text-3xl text-gray-900">{coherenceScore}%</span>
            </div>
          </div>

          {/* BARRA DE PROGRESSO COLORIDA */}
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div 
              className={`absolute top-0 left-0 h-full ${coherenceStatus.color} transition-all duration-1000 ease-out`}
              style={{ width: `${coherenceScore}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-xs font-medium">
             <span className={`${coherenceStatus.textClass} font-bold`}>
               {coherenceStatus.text}
             </span>
             <span className="text-gray-400">Meta: 100%</span>
          </div>
        </div>
      )}

      {/* 4. INSIGHTS + ESTRATÉGIA (VERSÃO ORIGINAL "PERFEITA" UNIFICADA) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* HEADER DO CARD */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-emerald-600" size={20} />
            <h3 className="font-bold text-lg text-gray-900">
              Insights Conscientes
            </h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Com base no seu perfil <strong>{userProfile.riskProfile}</strong> e na sua carteira atual, identificamos onde você deve focar seus próximos passos.
          </p>
        </div>

        {/* CORPO DO CARD (ESTRATÉGIA) */}
        <div className="p-6">
          <div className="mb-6">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estratégia do Mês</span>
            <div className="flex items-center gap-3 mt-2">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center ${rebalancingStrategy.content.color.split(' ')[0]} ${rebalancingStrategy.content.color.split(' ')[1]}`}>
                 {rebalancingStrategy.content.icon}
               </div>
               <div>
                 <p className="text-sm text-gray-500">Foco recomendado em:</p>
                 <h4 className="text-xl font-bold text-gray-900 leading-tight">
                   {rebalancingStrategy.content.title}
                 </h4>
               </div>
            </div>
          </div>

          {/* SESSÃO EDUCATIVA (ESTILO LISTA LIMPA) */}
          <div className="space-y-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
            
            <div className="flex gap-3 items-start">
              <HelpCircle className="text-gray-400 mt-0.5 shrink-0" size={16} />
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase mb-1">O que são?</p>
                <p className="text-sm text-gray-600 leading-relaxed">{rebalancingStrategy.content.whatIs}</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={16} />
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase mb-1">Por que faz sentido agora?</p>
                <p className="text-sm text-gray-600 leading-relaxed">{rebalancingStrategy.content.why}</p>
              </div>
            </div>

             <div className="flex gap-3 items-start">
              <Search className="text-blue-400 mt-0.5 shrink-0" size={16} />
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase mb-1">Como encontrar?</p>
                <p className="text-sm text-gray-600 leading-relaxed">{rebalancingStrategy.content.howToFind}</p>
              </div>
            </div>

             <div className="flex gap-3 items-start">
              <Target className="text-orange-400 mt-0.5 shrink-0" size={16} />
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase mb-1">Como decidir?</p>
                <p className="text-sm text-gray-600 leading-relaxed">{rebalancingStrategy.content.howToDecide}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 5. NEWS (MANTIDO) */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="text-emerald-500" />
          <h3 className="font-bold text-gray-900">Notícias do Setor</h3>
        </div>

        {MOCK_NEWS.map((news, idx) => (
          <a
            key={idx}
            href={news.url}
            className="block p-4 bg-gray-50 hover:bg-emerald-50 rounded-2xl mb-2 transition-colors border border-transparent hover:border-emerald-100"
          >
            <p className="font-semibold text-sm text-gray-800 leading-snug">{news.title}</p>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span className="font-medium text-emerald-700">{news.source}</span>
              <ExternalLink size={14} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default HomeTab;
