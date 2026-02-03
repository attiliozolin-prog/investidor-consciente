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
  AlertTriangle,
  Newspaper,
  ExternalLink,
} from "lucide-react";

import { IA } from "../../IA";
import MetricBox from "../common/MetricBox";

const HomeTab: React.FC<any> = ({
  userProfile,
  onAddTransaction,
  showValues,
  onToggleValues,
  holdings, // Recebe a LISTA de ativos
  rankedStocks,
}) => {
  // 1. Somar o saldo total da lista de ativos
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

  // 2. Calcular a Nota de Coerência
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

  // 3. CÉREBRO DA ESTRATÉGIA
  const rebalancingStrategy = useMemo(() => {
    // A. Metas do Perfil
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

    // B. Somar a lista manualmente para saber quanto temos de cada tipo
    const currentSums = { fixed_income: 0, fii: 0, stock: 0, total: 0 };

    holdings.forEach((h: any) => {
      if (h.assetType === "fixed_income")
        currentSums.fixed_income += h.totalValue;
      else if (h.assetType === "fii") currentSums.fii += h.totalValue;
      else currentSums.stock += h.totalValue;

      currentSums.total += h.totalValue;
    });

    const totalCalc = currentSums.total || 1; // Evita divisão por zero

    // C. Porcentagens Atuais
    const current = {
      fixed_income: currentSums.fixed_income / totalCalc,
      fii: currentSums.fii / totalCalc,
      stock: currentSums.stock / totalCalc,
    };

    // D. Calcular Gaps (Onde falta dinheiro?)
    const gaps = {
      fixed_income: target.fixed_income - current.fixed_income,
      fii: target.fii - current.fii,
      stock: target.stock - current.stock,
    };

    // E. Definir o Foco (Maior buraco)
    let focus = "fixed_income";
    let maxGap = -100;

    if (gaps.fixed_income > maxGap) {
      maxGap = gaps.fixed_income;
      focus = "fixed_income";
    }
    if (gaps.fii > maxGap) {
      maxGap = gaps.fii;
      focus = "fii";
    }
    if (gaps.stock > maxGap) {
      maxGap = gaps.stock;
      focus = "stock";
    }

    // F. Traduzir o Nome do Foco
    let focusName = "Renda Fixa";
    if (focus === "fii") focusName = "Fundos Imobiliários";
    if (focus === "stock") focusName = "Ações";

    // G. Filtrar Sugestões
    let suggestions = [];
    if (focus === "fixed_income") {
      suggestions = rankedStocks.filter(
        (s: any) =>
          s.assetType === "fixed_income" || s.ticker.includes("TESOURO")
      );
    } else if (focus === "fii") {
      suggestions = rankedStocks.filter((s: any) => s.assetType === "fii");
    } else {
      suggestions = rankedStocks.filter((s: any) => s.assetType === "stock");
    }

    return {
      focusClass: focusName,
      strategyText: `Foco em ${focusName}`,
      suggestions: suggestions.slice(0, 3),
    };
  }, [holdings, userProfile, rankedStocks]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-32">
      {/* CARD DE PATRIMÔNIO */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">
                Patrimônio Total
              </p>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold tracking-tight">
                  {showValues
                    ? `R$ ${totalBalance.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}`
                    : "••••••••"}
                </h2>
                <button
                  onClick={onToggleValues}
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  {showValues ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {totalBalance > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`text-sm font-bold flex items-center gap-1 ${
                      totalProfit >= 0 ? "text-emerald-300" : "text-red-300"
                    }`}
                  >
                    {totalProfit >= 0 ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                    {showValues ? `${profitPercentage.toFixed(2)}%` : "••••"}
                  </span>
                  <span className="text-emerald-200/60 text-xs">Histórico</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onAddTransaction}
            className="w-full bg-[#059669] hover:bg-[#047857] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} strokeWidth={3} /> Novo Aporte
          </button>
        </div>
      </div>

      {/* --- BOTÃO IA (Consultor) --- */}
      {/* Aqui é a mágica: Ele só aparece se tiver saldo para analisar */}
      {totalBalance > 0 && <IA carteira={holdings} />}

      {/* CARD DE COERÊNCIA GAMIFICADO (A PLANTA) */}
      {totalBalance > 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          {/* Fundo decorativo sutil */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-bl-full opacity-50 pointer-events-none" />

          <div className="flex justify-between items-center mb-4 relative z-10">
            <div>
              <h3 className="text-gray-900 font-bold text-lg">
                Seu jardim de investimentos
              </h3>
              <p className="text-gray-500 text-xs mt-1 max-w-[150px]">
                Quanto maior a coerência, mais sua árvore cresce.
              </p>
            </div>

            {/* A PLANTA QUE MUDA DE ACORDO COM A NOTA */}
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500 ${
                coherenceScore > 80
                  ? "bg-emerald-100 text-emerald-600"
                  : coherenceScore > 50
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {coherenceScore > 90 ? (
                <TreeDeciduous size={36} strokeWidth={2.5} /> // Árvore Grande
              ) : coherenceScore > 50 ? (
                <Leaf size={32} strokeWidth={2.5} /> // Planta saudável
              ) : (
                <Sprout size={32} strokeWidth={2.5} /> // Broto pequeno/frágil
              )}
            </div>
          </div>

          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold text-gray-900 tracking-tighter">
              {coherenceScore}%
            </span>
            <span className="text-sm font-medium text-gray-500 mb-1.5">
              de coerência
            </span>
          </div>

          {/* Barra de Progresso com degradê */}
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out relative z-10 flex items-center justify-end pr-1"
              style={{
                width: `${coherenceScore}%`,
                background:
                  coherenceScore > 80
                    ? "linear-gradient(90deg, #10b981 0%, #059669 100%)" // Verde Lindo
                    : coherenceScore > 50
                    ? "linear-gradient(90deg, #fbbf24 0%, #d97706 100%)" // Amarelo
                    : "#9ca3af", // Cinza/Murcho
              }}
            >
              {/* Brilho na ponta da barra */}
              <div className="w-1 h-1 bg-white/50 rounded-full" />
            </div>
          </div>

          {/* Mensagem de Feedback abaixo da barra */}
          <p className="text-xs text-center mt-3 font-medium">
            {coherenceScore > 90
              ? "🌳 Sua carteira está em climax!"
              : coherenceScore > 50
              ? "🌱 Sua carteira está florescendo, mas precisa de ajustes para evoluir."
              : "🍂 Seu jardim de investimentos precisa de atenção urgente."}
          </p>
        </div>
      )}

      {/* ESTRATÉGIA DO MÊS */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Target className="text-emerald-500" size={20} />
          <h3 className="font-bold text-gray-900">Estratégia do Mês</h3>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-3 relative z-10">
            <div className="p-2 bg-white rounded-full text-orange-600 shadow-sm mt-1">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-bold text-orange-900 text-sm mb-1">
                Agenda IA: Foco em {rebalancingStrategy.focusClass}
              </h3>
              <p className="text-xs text-orange-800 leading-relaxed mb-3">
                Detectamos que sua carteira está desbalanceada. Para atingir sua
                meta de perfil <strong>{userProfile.riskProfile}</strong> e
                reduzir a volatilidade, nossa IA recomenda priorizar esta classe
                de ativos agora.
              </p>

              <div className="pt-3 mt-1 border-t border-orange-200/50">
                <p className="text-[10px] text-orange-600/70 font-medium leading-tight text-justify">
                  * Nota Legal: Esta simulação utiliza metodologia proprietária
                  baseada em parâmetros ESG e rebalanceamento matemático. Não
                  constitui recomendação CVM.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {rebalancingStrategy.suggestions.map((stock: any) => (
            <div
              key={stock.ticker}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    stock.assetType === "fixed_income"
                      ? "bg-blue-100 text-blue-700"
                      : stock.assetType === "fii"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-white text-gray-700 border border-gray-200"
                  }`}
                >
                  {stock.ticker.substring(0, 3)}
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900">
                    {stock.ticker}
                  </div>
                  <div className="text-[10px] text-gray-500">{stock.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-emerald-600">
                  {stock.coherenceScore} pts
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INSIGHTS DE MERCADO */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="text-emerald-500" size={20} />
          <h3 className="font-bold text-gray-900">Insights de Mercado (IA)</h3>
        </div>
        <div className="space-y-3">
          {MOCK_NEWS.map((news, idx) => (
            <a
              key={idx}
              href={news.url}
              className="block p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 group"
            >
              <h4 className="font-semibold text-gray-800 text-sm mb-1 leading-snug group-hover:text-emerald-600 transition-colors">
                {news.title}
              </h4>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">
                  {news.source}
                </span>
                <ExternalLink
                  size={12}
                  className="text-gray-300 group-hover:text-emerald-500 transition-colors"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
