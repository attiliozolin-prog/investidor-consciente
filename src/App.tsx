import React, { useState, useMemo } from "react";
import {
  Search,
  User,
  Briefcase,
  Compass,
  Home,
  Leaf // <--- 1. ADICIONADO (Faltava este import)
} from "lucide-react";

import Onboarding from "./components/onboarding";
import AddTransactionModal from "./components/modals/AddTransactionModal";
import StockModal from "./components/modals/StockModal";
import CustomStrategyModal from "./components/modals/CustomStrategyModal";
import HomeTab from "./components/layout/tabs/HomeTab";
import PortfolioDashboard from "./components/layout/tabs/PortfolioDashboard";
import { Transaction, Holding, UserProfile } from "./types"; // Removi imports não usados para limpar
import { STOCKS_DB } from "./data/stocks";
import { MarketService } from "./services/market";
import { Loader2 } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [showValues, setShowValues] = useState(true);
  
  // -- CONTROLE DO MODAL DE TRANSAÇÃO --
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<"BUY" | "SELL">("BUY");

  // -- CONTROLE DE MERCADO --
  const [marketStocks, setMarketStocks] = useState<any[]>([]);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Efeito para buscar dados quando entrar na aba Market ou digitar
  React.useEffect(() => {
    if (activeTab === "market") {
      const delayDebounceFn = setTimeout(() => {
        setIsLoadingMarket(true);
        MarketService.searchStocks(searchTerm)
          .then(data => setMarketStocks(data))
          .finally(() => setIsLoadingMarket(false));
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [activeTab, searchTerm]);
  
  // -- CONTROLE DO MODAL DE ESTRATÉGIA PERSONALIZADA --
  const [isCustomStrategyOpen, setIsCustomStrategyOpen] = useState(false);

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

  // Derived: Holdings
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
      if (value.qty > 0 || (value.qty === 0 && value.totalCost > 0)) {
        if (value.qty <= 0 && value.totalCost <= 0) return;
        const stock = STOCKS_DB.find((s) => s.ticker === ticker);
        const currentPrice = stock ? stock.price : 0;
        const totalValue =
          stock?.assetType === "fixed_income"
            ? value.totalCost
            : value.qty * currentPrice;
            
        const avgPrice = value.qty > 0 ? value.totalCost / value.qty : 0;
        
        result.push({
          ticker,
          assetType: stock?.assetType || "stock",
          quantity: value.qty,
          averagePrice: avgPrice,
          currentPrice: stock?.assetType === "fixed_income" ? avgPrice : currentPrice,
          totalValue,
          profit: totalValue - value.totalCost,
          profitPercent: 0,
          allocationPercent: 0,
        });
      }
    });
    return result;
  }, [transactions]);

  // Derived: Ranked Stocks
  const rankedStocks = useMemo(() => {
    return STOCKS_DB.map((stock) => {
      const esgWeight = userProfile.esgImportance;
      const financialWeight = 1 - esgWeight;
      const score =
        stock.esgScore * esgWeight + stock.financialScore * financialWeight;
      return { ...stock, coherenceScore: Math.round(score) };
    }).sort((a, b) => b.coherenceScore - a.coherenceScore);
  }, [userProfile]);

  const handleAddTransaction = (t: Omit<Transaction, "id">) => {
    const updated = [
      ...transactions,
      { ...t, id: Math.random().toString(36).substr(2, 9) },
    ];
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

  // -- HANDLERS --
  const openBuyModal = () => {
    setTransactionModalType("BUY");
    setIsAddModalOpen(true);
  };

  const openSellModal = () => {
    setTransactionModalType("SELL");
    setIsAddModalOpen(true);
  };
  
  const handleRetakeOnboarding = () => {
    if(window.confirm("Deseja refazer o teste de perfil? Seus investimentos serão mantidos, mas as metas serão atualizadas.")) {
       setUserProfile(prev => ({ ...prev, isOnboardingComplete: false }));
    }
  };

  const handleSaveCustomStrategy = (targets: { fixed_income: number; fii: number; stock: number }) => {
    setUserProfile((prev) => ({
      ...prev,
      riskProfile: "Personalizado",
      customTargets: targets,
    }));
    setIsCustomStrategyOpen(false);
  };

  if (!userProfile.isOnboardingComplete)
    return <Onboarding onComplete={setUserProfile} />;

  return (
    <div className="max-w-5xl mx-auto bg-[#F9FAFB] min-h-screen relative shadow-2xl border-x border-gray-200">
      <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-white sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-emerald-700" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Olá, Investidor</h1>
            <p className="text-xs text-emerald-600 font-medium">
              {userProfile.riskProfile === "Personalizado" ? "Perfil Personalizado" : userProfile.goal}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (window.confirm("Resetar TUDO (incluindo carteira)? Essa ação é irreversível.")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-md hover:bg-red-100 transition-colors"
        >
          Resetar App
        </button>
      </header>

      <main className="p-6">
        {activeTab === "home" && (
          <HomeTab
            userProfile={userProfile}
            transactions={transactions}
            onAddTransaction={openBuyModal}
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
            onAddTransaction={openBuyModal}
            onSellTransaction={openSellModal}
            onRetakeOnboarding={handleRetakeOnboarding}
            onOpenCustomStrategy={() => setIsCustomStrategyOpen(true)}
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
          <div className="space-y-4 pb-32 animate-in fade-in">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-2 shadow-sm sticky top-20 z-10">
              <Search className="text-gray-400" />
              <input
                type="text"
                placeholder="Buscar na B3 (ex: PETR4, WEG3...)"
                className="w-full outline-none text-sm bg-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isLoadingMarket && <Loader2 className="animate-spin text-emerald-500" size={20} />}
            </div>

            <div className="space-y-3">
              {marketStocks.length === 0 && !isLoadingMarket && (
                <div className="text-center text-gray-400 py-10">
                  Nenhum ativo encontrado na B3.
                </div>
              )}
              
              {marketStocks.map((stock) => (
                <div
                  key={stock.ticker}
                  onClick={() => {
                    // ADAPTER: Garante o formato correto
                    const fullStockData = {
                       ...stock,
                       description: stock.description || `Ações da ${stock.name}`,
                       volatility: "Média",
                       dividendYield: 0,
                       peRatio: 0,
                       roe: 0,
                       coherenceScore: Math.round(
                         (stock.esgScore * userProfile.esgImportance) + 
                         (stock.financialScore * (1 - userProfile.esgImportance))
                       )
                    };
                    
                    // HACK SEGURO: Injeta no DB para persistência temporária
                    STOCKS_DB.push(fullStockData);
                    setSelectedStockTicker(stock.ticker);
                  }}
                  className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                      {stock.logo ? (
                        <img src={stock.logo} alt={stock.ticker} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-xs text-gray-600">{stock.ticker.substring(0, 2)}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 flex items-center gap-1">
                        {stock.ticker}
                        {stock.esgScore >= 80 && <Leaf size={12} className="text-emerald-500" fill="currentColor"/>}
                      </h4>
                      <p className="text-xs text-gray-500 max-w-[150px] truncate">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      R$ {stock.price?.toFixed(2)}
                    </div>
                    <div className="text-xs font-bold text-emerald-600">
                      {Math.round(
                         (stock.esgScore * userProfile.esgImportance) + 
                         (stock.financialScore * (1 - userProfile.esgImportance))
                       )} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center text-[10px] text-gray-400 mt-4">
              Dados de mercado fornecidos por B3/Brapi. <br/>
              Notas ESG baseadas em índices oficiais (ISE, Novo Mercado).
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-8 z-30">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "home" ? "text-emerald-400 scale-110" : "text-gray-400 hover:text-white"
          }`}
        >
          <Home size={22} />
          <span className="text-[10px] font-medium">Início</span>
        </button>
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "portfolio" ? "text-emerald-400 scale-110" : "text-gray-400 hover:text-white"
          }`}
        >
          <Briefcase size={22} />
          <span className="text-[10px] font-medium">Carteira</span>
        </button>
        <button
          onClick={() => setActiveTab("market")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "market" ? "text-emerald-400 scale-110" : "text-gray-400 hover:text-white"
          }`}
        >
          <Compass size={22} />
          <span className="text-[10px] font-medium">Explorar</span>
        </button>
      </nav>

      {isAddModalOpen && (
        <AddTransactionModal
          stocks={STOCKS_DB}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddTransaction}
          initialType={transactionModalType} 
        />
      )}
      
      {selectedStockTicker && (
        <StockModal
          // 2. CORREÇÃO DE CRASH:
          // Se não encontrar em rankedStocks (que é memoizado e pode não ter o item novo),
          // busca direto no STOCKS_DB onde acabamos de dar o .push().
          stock={
            rankedStocks.find((s) => s.ticker === selectedStockTicker) || 
            (STOCKS_DB.find((s) => s.ticker === selectedStockTicker) as any)
          }
          user={userProfile}
          coherenceScore={
            rankedStocks.find((s) => s.ticker === selectedStockTicker)?.coherenceScore || 
            (STOCKS_DB.find((s) => s.ticker === selectedStockTicker) as any)?.coherenceScore || 0
          }
          onClose={() => setSelectedStockTicker(null)}
        />
      )}

      {isCustomStrategyOpen && (
        <CustomStrategyModal
          currentTargets={userProfile.customTargets || { fixed_income: 40, fii: 30, stock: 30 }}
          onClose={() => setIsCustomStrategyOpen(false)}
          onSave={handleSaveCustomStrategy}
        />
      )}
    </div>
  );
}
