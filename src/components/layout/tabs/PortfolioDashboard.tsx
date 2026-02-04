import React, { useState, useMemo, useRef } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Check,
  Layers,
  Coins,
  Plus,
  Trash2,
  History,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { Holding, Transaction } from "../../../domain/portfolio/types";
import TransactionHistoryModal from "../../modals/TransactionHistoryModal";

/* =======================
   TYPES (LOCAIS)
======================= */

export type Transaction = {
  id: string;
  ticker: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  date: string;
};

type AssetType = "stock" | "fii" | "fixed_income";

type Holding = {
  ticker: string;
  assetType: AssetType;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profit: number;
  profitPercent: number;
  allocationPercent: number;
};

/* =======================
   COMPONENT
======================= */

const PortfolioDashboard: React.FC<any> = ({
  userProfile,
  transactions,
  onAddTransaction,
  onDeleteAsset,
  onDeleteTransaction,
  rankedStocks,
  showValues,
}) => {
  const [contributionAmount, setContributionAmount] = useState<string>("");
  const [smartSuggestion, setSmartSuggestion] = useState<
    { ticker: string; qty: number; cost: number; reason: string }[] | null
  >(null);
  const [suggestionType, setSuggestionType] = useState<string>("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const contributionSectionRef = useRef<HTMLDivElement>(null);

  /* =======================
     HOLDINGS (DERIVADO)
  ======================= */

  const holdings: Holding[] = useMemo(() => {
    const map = new Map<string, { qty: number; totalCost: number }>();

    transactions.forEach((t: Transaction) => {
      const current = map.get(t.ticker) || { qty: 0, totalCost: 0 };

      if (t.type === "BUY") {
        map.set(t.ticker, {
          qty: current.qty + t.quantity,
          totalCost: current.totalCost + t.quantity * t.price,
        });
      } else {
        const avgPrice =
          current.qty > 0 ? current.totalCost / current.qty : 0;
        map.set(t.ticker, {
          qty: current.qty - t.quantity,
          totalCost: current.totalCost - t.quantity * avgPrice,
        });
      }
    });

    let totalPortfolioValue = 0;
    const result: Holding[] = [];

    map.forEach((value, ticker) => {
      if (value.qty <= 0) return;

      const stock = rankedStocks.find((s: any) => s.ticker === ticker);
      const assetType: AssetType = stock?.assetType || "stock";
      const currentPrice =
        assetType === "fixed_income" ? value.totalCost / value.qty : stock?.price || 0;

      const totalValue =
        assetType === "fixed_income"
          ? value.totalCost
          : value.qty * currentPrice;

      totalPortfolioValue += totalValue;

      result.push({
        ticker,
        assetType,
        quantity: value.qty,
        averagePrice: value.totalCost / value.qty,
        currentPrice,
        totalValue,
        profit: totalValue - value.totalCost,
        profitPercent:
          value.totalCost > 0
            ? ((totalValue - value.totalCost) / value.totalCost) * 100
            : 0,
        allocationPercent: 0,
      });
    });

    return result
      .map((h) => ({
        ...h,
        allocationPercent:
          totalPortfolioValue > 0
            ? (h.totalValue / totalPortfolioValue) * 100
            : 0,
      }))
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [transactions, rankedStocks]);

  /* =======================
     TOTALS
  ======================= */

  const totalBalance = holdings.reduce((acc, h) => acc + h.totalValue, 0);
  const totalInvested = holdings.reduce(
    (acc, h) => acc + h.quantity * h.averagePrice,
    0
  );
  const totalProfit = totalBalance - totalInvested;

  /* =======================
     PIE CHART
  ======================= */

  const pieData = holdings.map((h) => ({
    name: h.ticker,
    value: h.totalValue,
  }));

  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#6b7280",
  ];

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="space-y-6 pb-32 animate-in fade-in">
      {/* HEADER */}
      <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
          <Wallet size={16} /> Patrimônio Total
        </div>
        <div className="text-4xl font-bold mb-4">
          {showValues
            ? `R$ ${totalBalance.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}`
            : "••••••••"}
        </div>
        <div className="grid grid-cols-2 gap-6 border-t border-gray-800 pt-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Investido</div>
            <div className="font-semibold text-xl text-gray-300">
              {showValues
                ? `R$ ${totalInvested.toLocaleString("pt-BR")}`
                : "••••"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Resultado</div>
            <div
              className={`font-semibold text-xl flex items-center gap-1 ${
                totalProfit >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {totalProfit >= 0 ? (
                <TrendingUp size={18} />
              ) : (
                <TrendingDown size={18} />
              )}
              {showValues
                ? `R$ ${Math.abs(totalProfit).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`
                : "••••"}
            </div>
          </div>
        </div>
      </div>

      {/* ATIVOS */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Layers size={18} /> Seus Ativos
          </h3>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            <History size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {holdings.map((h) => (
            <div
              key={h.ticker}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border"
            >
              <div>
                <div className="font-bold">{h.ticker}</div>
                <div className="text-xs text-gray-500">
                  {h.quantity} unidades
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-bold">
                  {showValues
                    ? `R$ ${h.totalValue.toFixed(0)}`
                    : "••••"}
                </div>
                <button
                  onClick={() => onDeleteAsset(h.ticker)}
                  className="text-gray-300 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GRÁFICO */}
      {holdings.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                paddingAngle={4}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ADD */}
      <button
        onClick={onAddTransaction}
        className="w-full py-4 border-2 border-dashed border-emerald-300 bg-emerald-50 rounded-2xl flex items-center justify-center gap-2 text-emerald-700 font-bold"
      >
        <Plus size={20} /> Adicionar Novo Ativo
      </button>

      {isHistoryOpen && (
        <TransactionHistoryModal
          transactions={transactions}
          onClose={() => setIsHistoryOpen(false)}
          onDelete={onDeleteTransaction}
        />
      )}
    </div>
  );
};

export default PortfolioDashboard;
