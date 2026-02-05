import React, { useState, useMemo } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Layers,
  Plus,
  Trash2,
  History,
  MinusCircle,
  Settings,
  PieChart as PieIcon,
  Info,
  X,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

import { Holding, Transaction } from "../../../types";
import TransactionHistoryModal from "../../modals/TransactionHistoryModal";

/* =======================
   COMPONENT
======================= */

const PortfolioDashboard: React.FC<any> = ({
  userProfile,
  transactions,
  onAddTransaction,
  onSellTransaction,
  onRetakeOnboarding,
  onDeleteAsset,
  onDeleteTransaction,
  rankedStocks,
  showValues,
}) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); // Novo Estado do Modal Educativo

  /* =======================
     HOLDINGS (CÁLCULOS)
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
        const avgPrice = current.qty > 0 ? current.totalCost / current.qty : 0;
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
      const assetType = stock?.assetType || "stock";
      const currentPrice = assetType === "fixed_income" ? value.totalCost / value.qty : stock?.price || 0;
      const totalValue = assetType === "fixed_income" ? value.totalCost : value.qty * currentPrice;

      totalPortfolioValue += totalValue;

      result.push({
        ticker,
        assetType,
        quantity: value.qty,
        averagePrice: value.totalCost / value.qty,
        currentPrice,
        totalValue,
        profit: totalValue - value.totalCost,
        profitPercent: value.totalCost > 0 ? ((totalValue - value.totalCost) / value.totalCost) * 100 : 0,
        allocationPercent: 0,
      });
    });

    return result
      .map((h) => ({
        ...h,
        allocationPercent: totalPortfolioValue > 0 ? (h.totalValue / totalPortfolioValue) * 100 : 0,
      }))
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [transactions, rankedStocks]);

  /* =======================
     TOTAIS & ALOCAÇÃO
  ======================= */
  const totalBalance = holdings.reduce((acc, h) => acc + h.totalValue, 0);
  const totalInvested = holdings.reduce((acc, h) => acc + h.quantity * h.averagePrice, 0);
  const totalProfit = totalBalance - totalInvested;

  const allocation = useMemo(() => {
    const groups = {
      fixed_income: { label: "Renda Fixa", value: 0, color: "#3b82f6" },
      fii: { label: "FIIs", value: 0, color: "#f59e0b" },
      stock: { label: "Ações", value: 0, color: "#10b981" },
    };

    holdings.forEach((h) => {
      const type = h.assetType as keyof typeof groups;
      if (groups[type]) groups[type].value += h.totalValue;
    });

    let targets = { fixed_income: 40, fii: 30, stock: 30 };
    if (userProfile.riskProfile === "Conservador") targets = { fixed_income: 80, fii: 15, stock: 5 };
    if (userProfile.riskProfile === "Arrojado") targets = { fixed_income: 20, fii: 35, stock: 45 };

    return Object.keys(groups).map((key) => {
      const k = key as keyof typeof groups;
      const currentPct = totalBalance > 0 ? (groups[k].value / totalBalance) * 100 : 0;
      return { id: k, ...groups[k], currentPct, targetPct: targets[k as keyof typeof targets] };
    });
  }, [holdings, totalBalance, userProfile.riskProfile]);

  /* =======================
     DADOS PIE CHART
  ======================= */
  const pieData = holdings.map((h) => ({ name: h.ticker, value: h.totalValue }));
  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#6b7280"];

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="space-y-6 pb-32 animate-in fade-in">
      
      {/* 1. HEADER PERFIL + INFO */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
           <div>
             <h2 className="font-bold text-gray-900 text-xl flex items-center gap-2">
               Minha Carteira
               {/* BOTÃO DE INFORMAÇÃO (EDUCATIVO) */}
               <button 
                 onClick={() => setIsInfoModalOpen(true)}
                 className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-1 rounded-full transition-colors"
               >
                 <Info size={18} />
               </button>
             </h2>
             <p className="text-xs text-gray-500">Perfil: {userProfile.riskProfile || 'Não definido'}</p>
           </div>
        </div>
        <button 
           onClick={onRetakeOnboarding}
           className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition-colors shadow-sm"
        >
           <Settings size={12} /> Recalibrar
        </button>
      </div>

      {/* 2. CARD PATRIMÔNIO */}
      <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
          <Wallet size={16} /> Patrimônio Total
        </div>
        <div className="text-4xl font-bold mb-4">
          {showValues ? `R$ ${totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "••••••••"}
        </div>
        <div className="grid grid-cols-2 gap-6 border-t border-gray-800 pt-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Investido</div>
            <div className="font-semibold text-xl text-gray-300">
              {showValues ? `R$ ${totalInvested.toLocaleString("pt-BR")}` : "••••"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Resultado</div>
            <div className={`font-semibold text-xl flex items-center gap-1 ${totalProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {totalProfit >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              {showValues ? `R$ ${Math.abs(totalProfit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "••••"}
            </div>
          </div>
        </div>
      </div>

      {/* 3. ALOCAÇÃO (METAS) */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
           <PieIcon className="text-emerald-600" size={18} />
           <div>
             <h3 className="font-bold text-gray-900">Arquitetura da Carteira</h3>
             <p className="text-[10px] text-gray-500 leading-tight">Comparativo: Atual vs. Meta Ideal</p>
           </div>
        </div>
        <div className="space-y-5">
           {allocation.map((item) => (
             <div key={item.id}>
               <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    {item.label}
                  </span>
                  <span className="text-gray-900 font-bold">
                    {item.currentPct.toFixed(0)}% <span className="text-gray-400 font-normal">/ Meta {item.targetPct}%</span>
                  </span>
               </div>
               <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(item.currentPct, 100)}%`, background: item.color }} />
                 <div className="absolute top-0 bottom-0 w-0.5 bg-gray-900 z-10" style={{ left: `${Math.min(item.targetPct, 100)}%` }} />
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* 4. LISTA DE ATIVOS */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2"><Layers size={18} /> Detalhe dos Ativos</h3>
          <button onClick={() => setIsHistoryOpen(true)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500" title="Histórico">
            <History size={18} />
          </button>
        </div>
        <div className="space-y-3">
          {holdings.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">Sua carteira está vazia.<br/>Comece aportando abaixo!</div>}
          {holdings.map((h) => (
            <div key={h.ticker} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
              <div>
                <div className="font-bold text-gray-900">{h.ticker}</div>
                <div className="text-xs text-gray-500">{h.quantity} cotas • {h.allocationPercent.toFixed(1)}%</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-bold text-right">
                  <div className="text-gray-900">{showValues ? `R$ ${h.totalValue.toFixed(0)}` : "••••"}</div>
                  <div className={`text-[10px] ${h.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>{h.profit >= 0 ? "+" : ""}{h.profitPercent.toFixed(1)}%</div>
                </div>
                <button onClick={() => onDeleteAsset(h.ticker)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. AÇÕES */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onAddTransaction} className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex flex-col items-center justify-center gap-1 font-bold shadow-lg shadow-emerald-100 transition-transform active:scale-95">
          <Plus size={24} /> Novo Aporte
        </button>
        <button onClick={onSellTransaction} className="py-4 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-2xl flex flex-col items-center justify-center gap-1 font-bold transition-transform active:scale-95">
          <MinusCircle size={24} /> Resgate / Venda
        </button>
      </div>

      {/* GRÁFICO (COM LEGENDAS CORRIGIDAS) */}
      {holdings.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Distribuição Visual</h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} // 🔥 LEGENDA FORÇADA NO GRÁFICO
                >
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* MODAL HISTÓRICO */}
      {isHistoryOpen && (
        <TransactionHistoryModal transactions={transactions} onClose={() => setIsHistoryOpen(false)} onDelete={onDeleteTransaction} />
      )}

      {/* NOVO MODAL: EDUCAÇÃO FINANCEIRA */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="bg-emerald-600 p-6 text-white">
              <button onClick={() => setIsInfoModalOpen(false)} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                <X size={20} />
              </button>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <BookOpen size={24} />
              </div>
              <h2 className="text-2xl font-bold">Por que esta carteira?</h2>
              <p className="text-emerald-100 text-sm mt-1">Entenda a ciência por trás da nossa sugestão.</p>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  Não coloque todos os ovos na mesma cesta
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Essa é a regra de ouro. A sugestão que damos para o seu perfil <strong>({userProfile.riskProfile})</strong> segue o conceito de <em>Alocação de Ativos</em>. A ideia é misturar investimentos seguros (Renda Fixa) com outros que podem crescer mais (Ações/FIIs).
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Conceito Oficial</p>
                <p className="text-sm text-gray-700 italic">
                  "A diversificação é o único almoço grátis no mercado financeiro."
                </p>
                <p className="text-xs text-gray-400 mt-2 text-right">— Harry Markowitz, Nobel de Economia (1952)</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Como funciona a "Meta Ideal"?</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Baseado na <strong>Teoria Moderna do Portfólio</strong>, definimos percentuais ideais para que você corra o risco certo para o seu objetivo.
                </p>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"/> <strong>Renda Fixa:</strong> O "colchão" de segurança.</li>
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5"/> <strong>FIIs:</strong> Para gerar renda mensal (aluguéis).</li>
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"/> <strong>Ações:</strong> O motor de crescimento a longo prazo.</li>
                </ul>
              </div>

              <div className="text-xs text-center text-gray-400 pt-4 border-t border-gray-100">
                Esta é uma sugestão educativa baseada em perfis genéricos. <br/>Não substitui a análise de um consultor profissional.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDashboard;
