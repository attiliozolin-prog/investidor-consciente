import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PieChart,
  Leaf,
  AlertCircle,
  TrendingUp,
  Info,
  ShieldCheck // <--- Adicionado aqui
} from "lucide-react";
import { UserProfile, Transaction, Holding } from "../../../types";

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
  
  // 1. CÁLCULO DA NOTA PONDERADA DA CARTEIRA
  const totalPortfolioValue = holdings.reduce((acc, h) => acc + h.totalValue, 0);
  
  const portfolioScore = React.useMemo(() => {
    if (totalPortfolioValue === 0) return 0;
    
    const totalWeightedScore = holdings.reduce((acc, h) => {
      // @ts-ignore: individualScore foi injetado no App.tsx
      const itemScore = h.individualScore || 50; 
      return acc + (itemScore * h.totalValue);
    }, 0);

    return Math.round(totalWeightedScore / totalPortfolioValue);
  }, [holdings, totalPortfolioValue]);

  // 2. DEFINIÇÃO DA COR E STATUS DA NOTA
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

  // 3. Totais Financeiros
  const totalInvested = transactions.reduce((acc, t) => {
    return t.type === "BUY" ? acc + t.quantity * t.price : acc - t.quantity * t.price;
  }, 0);
  
  const profit = totalPortfolioValue - totalInvested;
  const profitPercent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in">
      
      {/* CARD PRINCIPAL: PATRIMÔNIO */}
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

      {/* CARD SECUNDÁRIO: NOTA LIVO DA CARTEIRA (ATUALIZADO) */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Background Decorativo */}
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
             
             {/* Score Visual */}
             <div className="text-right">
                <div className={`text-4xl font-black ${scoreColor}`}>
                  {portfolioScore > 0 ? portfolioScore : "--"}
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block mt-1 ${scoreBg} ${scoreColor}`}>
                  {scoreLabel}
                </div>
             </div>
          </div>

          {/* Texto Explicativo (NOVO) */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-600 leading-relaxed">
              Este índice revela a coerência da sua carteira. Cruzamos a <strong>Nota Livo</strong> de cada ativo (Financeiro + ESG) com o <strong>peso financeiro</strong> que ele tem no seu bolso.
            </p>
          </div>

          {/* Insights Dinâmicos */}
          <div className="mt-4 space-y-2">
             {holdings.length === 0 ? (
               <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 text-blue-700 text-sm">
                 <Info size={16} className="shrink-0 mt-0.5" />
                 <p>Adicione seu primeiro ativo para descobrir a nota da sua carteira.</p>
               </div>
             ) : (
               <>
                 {portfolioScore < 60 && (
                   <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 text-orange-700 text-sm animate-in slide-in-from-left-2">
                     <AlertCircle size={16} className="shrink-0 mt-0.5" />
                     <p>Sua carteira tem ativos com nota baixa que estão pesando na média. Verifique os itens em alerta.</p>
                   </div>
                 )}
                 {portfolioScore >= 75 && (
                   <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm animate-in slide-in-from-left-2">
                     <Leaf size={16} className="shrink-0 mt-0.5" />
                     <p>Parabéns! Sua alocação está em perfeita sintonia com seus objetivos financeiros e valores.</p>
                   </div>
                 )}
               </>
             )}
          </div>
        </div>
      </div>

      {/* CARD: DIVERSIFICAÇÃO */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <PieChart size={20} className="text-gray-400" />
          Diversificação
        </h3>
        
        {holdings.length > 0 ? (
          <div className="space-y-4">
             {/* Barras de Alocação */}
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
             {holdings.length > 4 && (
               <p className="text-xs text-center text-gray-400 mt-2">+ {holdings.length - 4} outros ativos</p>
             )}
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
