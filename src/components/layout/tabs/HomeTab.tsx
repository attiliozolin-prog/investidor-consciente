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
  Landmark,
  Building2,
  LineChart,
} from "lucide-react";

import { Holding } from "../../../types";
import { IA } from "../../../IA";

/* =======================
   TIPOS
======================= */

type StrategyFocus = "fixed_income" | "fii" | "stock";

/* =======================
   MOCK NEWS
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
     ESTRATÉGIA DO MÊS (SEM TICKERS)
  ======================= */

  const strategy = useMemo(() => {
    const target: Record<StrategyFocus, number> = {
      fixed_income: 0.3,
      fii: 0.4,
      stock: 0.3,
    };

    if (userProfile.riskProfile === "Conservador") {
      target.fixed_income = 0.6;
      target.fii = 0.2;
      target.stock = 0.2;
    } else if (userProfile.riskProfile === "Arrojado") {
      target.fixed_income = 0.1;
      target.fii = 0.4;
      target.stock = 0.5;
    }

    const current: Record<StrategyFocus | "total", number> = {
      fixed_income: 0,
      fii: 0,
      stock: 0,
      total: 0,
    };

    holdings.forEach((h: Holding) => {
      current[h.assetType] += h.totalValue;
      current.total += h.totalValue;
    });

    const total = current.total || 1;

    const gaps: Record<StrategyFocus, number> = {
      fixed_income: target.fixed_income - current.fixed_income / total,
      fii: target.fii - current.fii / total,
      stock: target.stock - current.stock / total,
    };

    let focus: StrategyFocus = "fixed_income";
    let maxGap = -Infinity;

    (Object.keys(gaps) as StrategyFocus[]).forEach((key) => {
      if (gaps[key] > maxGap) {
        maxGap = gaps[key];
        focus = key;
      }
    });

    if (focus === "fii") {
      return {
        title: "Foco em Fundos Imobiliários",
        icon: <Building2 className="text-emerald-600" />,
        description:
          "Fundos Imobiliários ajudam a gerar renda recorrente e diversificar a carteira. São ativos negociados em bolsa e, no Brasil, geralmente terminam com o número 11. Procure por FIIs alinhados ao seu perfil no app de investimentos.",
      };
    }

    if (focus === "stock") {
      return {
        title: "Foco em Ações",
        icon: <LineChart className="text-blue-600" />,
        description:
          "Ações representam participação em empresas. São indicadas para crescimento no longo prazo e podem oscilar mais no curto prazo. Busque empresas sólidas, alinhadas ao seu perfil de risco.",
      };
    }

    return {
      title: "Foco em Renda Fixa",
      icon: <Landmark className="text-amber-600" />,
      description:
        "Renda fixa traz previsibilidade e segurança para a carteira. É essencial para equilíbrio, reserva de emergência e proteção em cenários de volatilidade.",
    };
  }, [holdings, userProfile]);

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="space-y-6 pb-32">
      {/* PATRIMÔNIO */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-xl">
        <p className="text-emerald-100 text-sm">Patrimônio Total</p>

        <div className="flex items-center gap-3 mt-1">
          <h2 className="text-3xl font-bold">
            {showValues
              ? `R$ ${totalBalance.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}`
              : "••••••••"}
          </h2>

          <button onClick={onToggleValues}>
            {showValues ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {totalBalance > 0 && (
          <div className="mt-2 flex items-center gap-2 text-sm font-bold">
            {totalProfit >= 0 ? <TrendingUp /> : <TrendingDown />}
            {showValues ? `${profitPercentage.toFixed(2)}%` : "••••"}
          </div>
        )}

        <button
          onClick={onAddTransaction}
          className="mt-6 w-full bg-emerald-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Plus /> Novo Aporte
        </button>
      </div>

      {/* IA */}
      {totalBalance > 0 && <IA carteira={holdings} />}

      {/* COERÊNCIA */}
      {totalBalance > 0 && (
        <div className="bg-white rounded-3xl p-6 border">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold">Seu jardim de investimentos</h3>
              <p className="text-xs text-gray-500">
                Quanto maior a coerência, mais sua árvore cresce.
              </p>
            </div>

            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gray-100">
              {coherenceScore > 90 ? (
                <TreeDeciduous size={36} />
              ) : coherenceScore > 50 ? (
                <Leaf size={32} />
              ) : (
                <Sprout size={32} />
              )}
            </div>
          </div>

          <p className="text-4xl font-bold">{coherenceScore}%</p>
        </div>
      )}

      {/* ESTRATÉGIA DO MÊS */}
      <div className="bg-white rounded-3xl p-6 border">
        <div className="flex items-center gap-2 mb-3">
          <Target className="text-emerald-500" />
          <h3 className="font-bold">Estratégia do Mês</h3>
        </div>

        <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
          <div className="mt-1">{strategy.icon}</div>
          <div>
            <p className="font-bold mb-1">{strategy.title}</p>
            <p className="text-sm text-gray-600">{strategy.description}</p>
          </div>
        </div>
      </div>

      {/* NEWS */}
      <div className="bg-white rounded-3xl p-6 border">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="text-emerald-500" />
          <h3 className="font-bold">Insights de Mercado</h3>
        </div>

        {MOCK_NEWS.map((news, idx) => (
          <a
            key={idx}
            href={news.url}
            className="block p-3 bg-gray-50 rounded-xl mb-2"
          >
            <p className="font-semibold text-sm">{news.title}</p>
            <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
              <span>{news.source}</span>
              <ExternalLink size={12} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default HomeTab;
