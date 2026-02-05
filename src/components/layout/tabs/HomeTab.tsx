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
    icon: <ShieldCheck size={32} className="text-blue-600" />,
    color: "bg-blue-50 text-blue-900 border-blue-100",
    barColor: "bg-blue-500",
    whatIs: "Empréstimo para bancos ou governo em troca de juros seguros.",
    why: "Sua carteira precisa de mais estabilidade para proteger seu patrimônio de oscilações bruscas.",
    howToFind: "No app da corretora, busque por: Tesouro Selic, CDB ou LCI/LCA.",
    howToDecide: "Para reserva: Tesouro Selic. Para render mais: CDBs que paguem acima de 100% do CDI.",
  },
  fii: {
    title: "Fundos Imobiliários",
    icon: <Building2 size={32} className="text-orange-600" />,
    color: "bg-orange-50 text-orange-900 border-orange-100",
    barColor: "bg-orange-500",
    whatIs: "Você vira 'dono' de pedacinhos de grandes imóveis (shoppings, galpões) e recebe aluguéis mensais.",
    why: "Ideal para gerar 'renda passiva' (dinheiro caindo na conta todo mês) isenta de Imposto de Renda.",
    howToFind: "Na busca da corretora, digite códigos com final 11 (Ex: HGLG11, KNRI11).",
    howToDecide: "Prefira fundos de 'Tijolo' (imóveis reais) com muitos inquilinos e imóveis de qualidade.",
  },
  stock: {
    title: "Ações",
    icon: <TrendingUp size={32} className="text-emerald-600" />,
    color: "bg-emerald-50 text-emerald-900 border-emerald-100",
    barColor: "bg-emerald-500",
    whatIs: "Pedaços de empresas reais. Você vira sócio e lucra com o crescimento do negócio.",
    why: "Necessário para seu dinheiro crescer acima da inflação no longo prazo, apesar do risco maior.",
    howToFind: "Busque códigos de 4 letras (Ex: WEG3, ITUB4, VALE3).",
    howToDecide: "Busque empresas líderes, com lucros crescentes e, de preferência, boas notas ESG.",
  },
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

  const profitPercentage =
    totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  /* =======================
     COERÊNCIA
  ======================= */
  const coherenceScore = useMemo(() => {
    if (totalBalance === 0) return 0;

    let weightedScoreSum = 0;

    holdings.forEach((h: Holding) => {
      const stockRank = rankedStocks.find(
        (r: any) => r.ticker === h.ticker
      );
      const score = stockRank ? stockRank.coherenceScore : 50;
      weightedScoreSum += score * h.totalValue;
    });

    return Math.round(weightedScoreSum / totalBalance);
  }, [holdings, rankedStocks, totalBalance]);

  /* =======================
     REBALANCEAMENTO (CÁLCULO DA ESTRATÉGIA)
  ======================= */
  const rebalancingStrategy = useMemo(() => {
    // 1. Define metas baseadas no perfil
    const target = { fixed_income: 0.3, fii: 0.4, stock: 0.3 };

    if (userProfile.riskProfile === "Conservador") {
      target.fixed_income = 0.6;
      target.fii = 0.2;
      target.stock = 0.2;
    } else if (userProfile.riskProfile === "Arrojado") {
      target.fixed_income = 0.1;
      target.fii = 0.4;
      target.stock = 0.5;
    }

    // 2. Calcula alocação atual
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

    // 3. Encontra onde falta mais dinheiro (maior gap)
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
      content: STRATEGY_CONTENT[focus],
      currentPct: current[focus] * 100,
      targetPct: target[focus] * 100
    };
  }, [holdings, userProfile]);

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="space-y-6 pb-32 animate-in fade-in">
      {/* CARD 1: PATRIMÔNIO (Mantido igual) */}
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

      {/* IA */}
      {totalBalance > 0 && <IA carteira={holdings} />}

      {/* COERÊNCIA */}
      {totalBalance > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Jardim Consciente</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
              O equilíbrio entre retorno e seus valores pessoais.
            </p>
          </div>
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-1">
              {coherenceScore > 90 ? <TreeDeciduous size={32} /> : coherenceScore > 50 ? <Leaf size={28} /> : <Sprout size={28} />}
            </div>
            <span className="font-bold text-xl text-emerald-700">{coherenceScore}%</span>
          </div>
        </div>
      )}

      {/* =======================================================
          NOVO CARD UNIFICADO: INSIGHTS + ESTRATÉGIA + BARRA
      ======================================================= */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* CABEÇALHO UNIFICADO */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-emerald-600" size={20} />
            <h3 className="font-bold text-lg text-gray-900">
              Insights para decisões mais conscientes
            </h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Essas análises ajudam você a entender o equilíbrio da sua carteira. 
            De acordo com seu perfil <strong>{userProfile.riskProfile}</strong>, esse deve ser o foco de seus próximos investimentos.
          </p>
        </div>

        {/* CORPO DA ESTRATÉGIA */}
        <div className="p-6">
          <div className="mb-6">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowRight size={12} /> Estratégia do Mês
            </span>
            
            <div className="flex items-center gap-4 mt-3 mb-4">
               {/* ÍCONE GRANDE */}
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${rebalancingStrategy.content.color}`}>
                 {rebalancingStrategy.content.icon}
               </div>
               
               <div>
                 <p className="text-sm text-gray-500">Oportunidade de aporte em:</p>
                 <h4 className="text-xl font-bold text-gray-900 leading-tight">
                   {rebalancingStrategy.content.title}
                 </h4>
               </div>
            </div>

            {/* BARRA DE PROGRESSO (A VOLTA DA BARRA COLORIDA) */}
            <div className="bg-gray-100 rounded-full h-4 w-full overflow-hidden relative">
              {/* Barra de preenchimento atual */}
              <div 
                className={`h-full ${rebalancingStrategy.content.barColor} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(rebalancingStrategy.currentPct, 100)}%` }}
              />
              {/* Marcador de Meta (Target) */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-black/20"
                style={{ left: `${Math.min(rebalancingStrategy.targetPct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-500 mt-2">
              <span>Atual: {rebalancingStrategy.currentPct.toFixed(0)}%</span>
              <span>Ideal: {rebalancingStrategy.targetPct.toFixed(0)}%</span>
            </div>
          </div>

          {/* SESSÃO EDUCATIVA (CARDS LATERAIS) */}
          <div className="grid gap-3">
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-gray-800 font-bold text-sm">
                <HelpCircle size={16} className="text-gray-400" /> O que são?
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{rebalancingStrategy.content.whatIs}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-gray-800 font-bold text-sm">
                <CheckCircle2 size={16} className="text-emerald-500" /> Por que faz sentido?
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{rebalancingStrategy.content.why}</p>
            </div>

             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-gray-800 font-bold text-sm">
                <Search size={16} className="text-blue-500" /> Como encontrar?
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{rebalancingStrategy.content.howToFind}</p>
            </div>

             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-gray-800 font-bold text-sm">
                <Target size={16} className="text-orange-500" /> Como decidir?
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{rebalancingStrategy.content.howToDecide}</p>
            </div>

          </div>
        </div>
      </div>

      {/* NEWS */}
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
