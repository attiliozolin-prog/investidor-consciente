import React, { useState, useMemo } from "react";
import {
  Search,
  User,
  Briefcase,
  Compass,
  Home,
} from "lucide-react";

// --- COMPONENTES ---
import Onboarding from "./components/onboarding";
import AddTransactionModal from "./components/modals/AddTransactionModal";
import StockModal from "./components/modals/StockModal";
import HomeTab from "./components/layout/tabs/HomeTab";
import PortfolioDashboard from "./components/layout/tabs/PortfolioDashboard";

// --- DADOS E TIPOS (Conexão Correta) ---
import { STOCKS_DB } from "./data/stocks"; // Agora usa a base oficial
import { 
  Transaction, 
  Holding, 
  UserProfile, 
  InvestmentGoal, 
  RiskProfile 
} from "./types"; // Tipos centralizados

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [showValues, setShowValues] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStockTicker, setSelectedStockTicker] = useState<string | null>(null);

  // State: Profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    goal: null,
    esgImportance: 0.5,
    riskProfile: null,
    isOnboardingComplete: false,
  });

  // State: Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  // Derived: Holdings (Cálculo da Carteira)
  const holdings = useMemo(() => {
    const map = new Map<string, { qty: number; totalCost: number }>();
    
    transactions.forEach((t) => {
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

    const result: Holding[] = [];
    
    map.forEach((value, ticker) => {
      // Ignora se quantidade for zero ou menor, a menos que haja custo residual (lucro/prejuízo realizado)
      // Simplificação: mostra apenas ativos com quantidade > 0 na lista principal
      if (value.qty > 0) {
        const stock = STOCKS_DB.find((s) => s.ticker === ticker);
        const currentPrice = stock ? stock.price : 0;
        
        // Renda Fixa assume preço = custo (simplificação) ou preço atual se disponível
        const finalPrice = stock?.assetType === "fixed_income" 
          ? (value.qty > 0 ? value.totalCost / value.qty : 0) // Preço médio para RF
          : currentPrice;

        const totalValue = value.qty * finalPrice;

        result.push({
          ticker,
          assetType: stock?.assetType || "stock",
          quantity: value.qty,
          averagePrice: value.qty > 0 ? value.totalCost / value.qty : 0,
          currentPrice: finalPrice,
          totalValue,
          profit: totalValue - value.totalCost,
          profitPercent: 0, // Pode calcular se desejar
          allocationPercent: 0, // Será calculado no dashboard se necessário
        });
      }
    });
    
    return result;
  }, [transactions]);

  // Derived: Ranked Stocks (Ranking de Coerência)
  const rankedStocks = useMemo(() => {
    return STOCKS_DB.map((stock) => {
      const esgWeight = userProfile.esgImportance;
      const financialWeight = 1 - esgWeight;
      const score =
        stock.esgScore * esgWeight + stock.financialScore * financialWeight;
      return { ...stock, coherenceScore: Math.round(score) };
    }).sort((a, b) => b.coherenceScore - a.coherenceScore);
  }, [userProfile]);

  // Handlers
  const handleAddTransaction = (t: Omit<Transaction, "id">) => {
    const newTransaction = { ...t, id: Math.random().toString(36).substr(2, 9) };
    const updated = [...transactions, newTransaction];
    setTransactions(updated);
    localStorage.setItem("transactions", JSON.stringify(updated));
  };

  const handleDeleteAsset = (ticker: string) => {
    if (confirm(`Tem certeza que deseja remover todo o histórico de ${ticker}?`)) {
      const updated = transactions.filter((t) => t.ticker !== ticker);
      setTransactions(updated);
      localStorage.setItem("transactions", JSON.stringify(updated));
    }
  };

  // --- RENDER ---

  if (!userProfile.isOnboardingComplete)
    return <Onboarding onComplete={setUserProfile} />;

  return (
    <div className="max-w-5xl mx-auto bg-[#F9FAFB] min-h-screen relative shadow-2xl border-x border-gray-200">
      {/* HEADER FIXO */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-white sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-emerald-700" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Olá, Investidor</h1>
            <p className="text-xs text-emerald-600 font-medium">
              {userProfile.goal}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (window.confirm("Resetar o App? Isso apagará todos os seus dados.")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="text-xs font-bold text-red-600 bg-red-100 px-3 py-2 rounded-md hover:bg-red-200 transition-colors"
        >
          Resetar
        </button>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="p-6">
        {activeTab === "home" && (
          <HomeTab
            userProfile={userProfile}
            transactions={transactions}
            onAddTransaction={() => setIsAddModalOpen(true)}
            showValues={showValues}
            onToggleValues={() => setShowValues(!showValues)}
            holdings={holdings}
            rankedStocks={rankedStocks}
          />
        )}
        
        {activeTab === "portfolio" && (
          <PortfolioDashboard
            userProfile={userProfile}
            transactions={transactions}
            onAddTransaction={() => setIsAddModalOpen(true)}
            onDeleteAsset={handleDeleteAsset}
            onDeleteTransaction={(id: string) => {
              const updated = transactions.filter((t) => t.id !== id);
              setTransactions(updated);
              localStorage.setItem("transactions", JSON.stringify(updated));
            }}
            rankedStocks={rankedStocks}
            showValues={showValues}
          />
        )}
        
        {activeTab === "market" && (
          <div className="space-y-4 pb-32">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-2">
              <Search className="text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ativos (WEG3, ITAU4...)"
                className="w-full outline-none text-sm"
              />
            </div>
            <div className="space-y-3">
              {rankedStocks.map((stock) => (
                <div
                  key={stock.ticker}
                  onClick={() => setSelectedStockTicker(stock.ticker)}
                  className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center cursor-pointer hover:border-emerald-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center font-bold text-xs text-gray-600">
                      {stock.ticker.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {stock.ticker}
                      </h4>
                      <p className="text-xs text-gray-500">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      R$ {stock.price.toFixed(2)}
                    </div>
                    <div className="text-xs font-bold text-emerald-600">
                      {stock.coherenceScore} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* NAVBAR NAVEGAÇÃO */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-8 z-30">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "home"
              ? "text-emerald-400 scale-110"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Home size={22} />
          <span className="text-[10px] font-medium">Início</span>
        </button>
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "portfolio"
              ? "text-emerald-400 scale-110"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Briefcase size={22} />
          <span className="text-[10px] font-medium">Carteira</span>
        </button>
        <button
          onClick={() => setActiveTab("market")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "market"
              ? "text-emerald-400 scale-110"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Compass size={22} />
          <span className="text-[10px] font-medium">Explorar</span>
        </button>
      </nav>

      {/* MODAIS */}
      {isAddModalOpen && (
        <AddTransactionModal
          stocks={STOCKS_DB} // Agora usa a base importada
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddTransaction}
        />
      )}
      
      {selectedStockTicker && (
        <StockModal
          stock={rankedStocks.find((s) => s.ticker === selectedStockTicker)!}
          user={userProfile}
          coherenceScore={
            rankedStocks.find((s) => s.ticker === selectedStockTicker)
              ?.coherenceScore || 0
          }
          onClose={() => setSelectedStockTicker(null)}
        />
      )}
    </div>
  );
}
