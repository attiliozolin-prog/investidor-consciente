import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  User,
  Briefcase,
  Compass,
  Home,
  Leaf,
  Loader2,
  ShieldCheck,
  Info
} from "lucide-react";

import Onboarding from "./components/onboarding";
import AddTransactionModal from "./components/modals/AddTransactionModal";
import StockModal from "./components/modals/StockModal";
import CustomStrategyModal from "./components/modals/CustomStrategyModal";
import MethodologyModal from "./components/modals/MethodologyModal";
import HomeTab from "./components/layout/tabs/HomeTab";
import PortfolioDashboard from "./components/layout/tabs/PortfolioDashboard";
import { Transaction, Holding, UserProfile } from "./types";
import { STOCKS_DB } from "./data/stocks";
import { MarketService, EsgScoreData } from "./services/market";

// COMPONENTE DE LOGO INTELIGENTE (CORRIGIDO)
// Prioriza o logo da API, depois tenta outras fontes, e por fim usa iniciais.
const StockLogo = ({ ticker, name, logoUrl, size = "md" }: { ticker: string, name: string, logoUrl?: string | null, size?: "sm" | "md" | "lg" }) => {
  const [errorCount, setErrorCount] = useState(0);
  
  // Fontes de Logo (Ordem de preferência)
  const sources = [
    logoUrl, // Fonte 0: Logo oficial da API (Brapi) - Prioridade MÁXIMA
    `https://raw.githubusercontent.com/thecapybara/br-logos/main/logos/${ticker.toUpperCase()}.png`, // Fonte 1
    `https://raw.githubusercontent.com/lbcosta/b3-logos/main/png/${ticker.toUpperCase()}.png`,     // Fonte 2
    // Fonte 3 (Tentativa baseada no nome - pode falhar se o nome for o ticker)
    `https://logospng.org/download/${name.split(' ')[0].toLowerCase()}/${name.split(' ')[0].toLowerCase()}-logo-icon.png` 
  ].filter(Boolean) as string[]; // Remove urls nulas/undefined

  const sizeClasses = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-14 h-14 text-sm"
  };

  // Se todas as fontes falharem ou não houver fontes válidas
  if (errorCount >= sources.length || sources.length === 0) {
    // Fallback Final: Avatar com Iniciais
    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-gray-100 text-gray-500 font-bold flex items-center justify-center border border-gray-200 select-none`}>
        {ticker.substring(0, 2)}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-white flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm p-0.5`}>
      <img
        src={sources[errorCount]}
        alt={name}
        className="w-full h-full object-contain"
        onError={() => setErrorCount(prev => prev + 1)}
      />
    </div>
  );
};

export default function App() {
  // ==========================================
  // 1. GESTÃO DE ESTADO (STATES)
  // ==========================================
  
  const [activeTab, setActiveTab] = useState("home");
  const [showValues, setShowValues] = useState(true);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    goal: null,
    esgImportance: 0.5,
    riskProfile: null,
    isOnboardingComplete: false,
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem("transactions");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<"BUY" | "SELL">("BUY");
  const [selectedStock, setSelectedStock] = useState<any | null>(null);
  const [isCustomStrategyOpen, setIsCustomStrategyOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  const [marketStocks, setMarketStocks] = useState<any[]>([]);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEsgOnly, setFilterEsgOnly] = useState(false);

  const [esgMap, setEsgMap] = useState<Record<string, EsgScoreData>>({});
  const [isEsgMapLoaded, setIsEsgMapLoaded] = useState(false);

  // ==========================================
  // 2. EFEITOS
  // ==========================================

  useEffect(() => {
    MarketService.getEsgScores().then(map => {
      setEsgMap(map);
      setIsEsgMapLoaded(true);
    });
  }, []);

  useEffect(() => {
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

  // ==========================================
  // 3. LÓGICA CALCULADA
  // ==========================================

  const holdings = useMemo(() => {
    const map = new Map<string, { qty: number; totalCost: number }>();
    transactions.forEach((t) => {
      const current = map.get(t.ticker) || { qty: 0, totalCost: 0 };
      if (t.type === "BUY") {
        map.set(t.ticker, { qty: current.qty + t.quantity, totalCost: current.totalCost + t.quantity * t.price });
      } else {
        const avgPrice = current.qty > 0 ? current.totalCost / current.qty : 0;
        map.set(t.ticker, { qty: current.qty - t.quantity, totalCost: current.totalCost - t.quantity * avgPrice });
      }
    });
    const result: Holding[] = [];
    map.forEach((value, ticker) => {
      if (value.qty > 0 || (value.qty === 0 && value.totalCost > 0)) {
        if (value.qty <= 0 && value.totalCost <= 0) return;
        const stock = STOCKS_DB.find((s) => s.ticker === ticker);
        const currentPrice = stock ? stock.price : (value.totalCost / (value.qty || 1));
        const totalValue = stock?.assetType === "fixed_income" ? value.totalCost : value.qty * currentPrice;
        const avgPrice = value.qty > 0 ? value.totalCost / value.qty : 0;
        result.push({
          ticker, assetType: stock?.assetType || "stock", quantity: value.qty, averagePrice: avgPrice, currentPrice: stock?.assetType === "fixed_income" ? avgPrice : currentPrice, totalValue, profit: totalValue - value.totalCost, profitPercent: 0, allocationPercent: 0,
        });
      }
    });
    return result;
  }, [transactions]);

  const rankedStocks = useMemo(() => {
    return STOCKS_DB.map((stock) => {
      const esgWeight = userProfile.esgImportance;
      const financialWeight = 1 - esgWeight;
      const score = stock.esgScore * esgWeight + stock.financialScore * financialWeight;
      return { ...stock, coherenceScore: Math.round(score) };
    }).sort((a, b) => b.coherenceScore - a.coherenceScore);
  }, [userProfile]);

  const displayedStocks = useMemo(() => {
    const enriched = marketStocks.map(stock => {
      const b3Data = esgMap[stock.ticker] || { score: 5, badges: [] };
      return { ...stock, ...b3Data };
    });
    return enriched.filter(stock => {
       if (!filterEsgOnly) return true;
       return stock.score >= 50;
    });
  }, [marketStocks, filterEsgOnly, esgMap]);

  // ==========================================
  // 4. HANDLERS
  // ==========================================

  const handleAddTransaction = (t: Omit<Transaction, "id">) => {
    const updated = [...transactions, { ...t, id: Math.random().toString(36).substr(2, 9) }];
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

  const openBuyModal = () => setIsAddModalOpen(true);
  const openSellModal = () => setIsAddModalOpen(true);
  
  const handleRetakeOnboarding = () => {
    if(window.confirm("Deseja refazer o teste de perfil?")) {
       setUserProfile(prev => ({ ...prev, isOnboardingComplete: false }));
    }
  };

  const handleSaveCustomStrategy = (targets: { fixed_income: number; fii: number; stock: number }) => {
    setUserProfile((prev) => ({ ...prev, riskProfile: "Personalizado", customTargets: targets }));
    setIsCustomStrategyOpen(false);
  };

  if (!userProfile.isOnboardingComplete) return <Onboarding onComplete={setUserProfile} />;

  return (
    <div className="max-w-5xl mx-auto bg-[#F9FAFB] min-h-screen relative shadow-2xl border-x border-gray-200">
      
      {/* HEADER LIVO */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-white sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
            <Leaf size={24} fill="currentColor" className="opacity-20" />
            <Leaf size={20} className="absolute" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">Livo</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              {userProfile.riskProfile === "Personalizado" ? "Estratégia Própria" : userProfile.goal || "Investidor Consciente"}
            </p>
          </div>
        </div>
        <button onClick={() => { if (window.confirm("Tem certeza?")) { localStorage.clear(); window.location.reload(); } }} className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors">
          Sair / Resetar
        </button>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="p-6">
        
        {activeTab === "home" && (
          <HomeTab userProfile={userProfile} transactions={transactions} onAddTransaction={openBuyModal} showValues={showValues} onToggleValues={() => setShowValues(!showValues)} holdings={holdings} rankedStocks={rankedStocks} />
        )}

        {activeTab === "portfolio" && (
          <PortfolioDashboard userProfile={userProfile} transactions={transactions} onAddTransaction={openBuyModal} onSellTransaction={openSellModal} onRetakeOnboarding={handleRetakeOnboarding} onOpenCustomStrategy={() => setIsCustomStrategyOpen(true)} onDeleteAsset={handleDeleteAsset} onDeleteTransaction={() => {}} rankedStocks={rankedStocks} showValues={showValues} />
        )}

        {activeTab === "market" && (
          <div className="space-y-4 pb-32 animate-in fade-in">
            <div className="sticky top-20 z-10 space-y-2">
               
               {/* Botão de Metodologia */}
               <button onClick={() => setIsMethodologyOpen(true)} className="w-full bg-emerald-900/5 hover:bg-emerald-900/10 border border-emerald-900/10 p-3 rounded-xl flex items-center justify-between group transition-all">
                 <div className="flex items-center gap-2">
                   <div className="bg-white p-1.5 rounded-lg shadow-sm"><ShieldCheck size={16} className="text-emerald-700" /></div>
                   <div className="text-left"><p className="text-xs font-bold text-gray-800 group-hover:text-emerald-800">Como calculamos a Nota Livo?</p><p className="text-[10px] text-gray-500">Conheça os critérios da B3 que usamos.</p></div>
                 </div>
                 <Info size={14} className="text-gray-400 group-hover:text-emerald-600" />
               </button>

               {/* Barra de Busca */}
               <div className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-2 shadow-sm">
                  <Search className="text-gray-400" />
                  <input type="text" placeholder="Buscar na B3 (ex: WEGE3, VALE3...)" className="w-full outline-none text-sm bg-transparent" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  {isLoadingMarket && <Loader2 className="animate-spin text-emerald-500" size={20} />}
               </div>
               
               {/* Status e Filtro */}
               <div className="flex justify-end items-center gap-2">
                 {!isEsgMapLoaded && <span className="text-[10px] text-gray-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> Sincronizando B3...</span>}
                 <button onClick={() => setFilterEsgOnly(!filterEsgOnly)} className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all border ${filterEsgOnly ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-white text-gray-500 border-gray-200 hover:border-emerald-200"}`}>
                   <Leaf size={12} fill={filterEsgOnly ? "currentColor" : "none"} /> Apenas Destaques ESG
                 </button>
               </div>
            </div>

            <div className="space-y-3">
              {displayedStocks.length === 0 && !isLoadingMarket && (
                <div className="text-center py-10">
                   <p className="text-gray-400 mb-2">Nenhum ativo encontrado.</p>
                   {filterEsgOnly && <p className="text-xs text-orange-400">Tente desativar o filtro ESG.</p>}
                </div>
              )}
              
              {displayedStocks.map((stock) => {
                const userPersonalScore = Math.round((stock.score * userProfile.esgImportance) + (60 * (1 - userProfile.esgImportance)));

                return (
                 <div
                   key={stock.ticker}
                   onClick={() => {
                      const fullStockData = {
                         ...stock,
                         description: stock.description || `Ações da ${stock.name}`,
                         esgScore: stock.score, 
                         tags: stock.badges, 
                         coherenceScore: userPersonalScore,
                         volatility: "Média", dividendYield: stock.dividendYield || 0, peRatio: stock.peRatio || 0, roe: stock.roe || 0
                      };
                      STOCKS_DB.push(fullStockData);
                      setSelectedStock(fullStockData);
                   }}
                   className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all"
                 >
                    <div className="flex items-center gap-3 w-full">
                        {/* NOVO COMPONENTE DE LOGO COM URL DA API */}
                        <div className="shrink-0">
                           <StockLogo ticker={stock.ticker} name={stock.name} logoUrl={stock.logo} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                             <h4 className="font-bold text-gray-900">{stock.ticker}</h4>
                             {stock.badges && stock.badges.length > 0 && <Leaf size={12} className="text-emerald-500" fill="currentColor"/>}
                          </div>
                          {/* NOME DA EMPRESA (Vem da API) */}
                          <p className="text-xs text-gray-500 truncate">{stock.name}</p>
                        </div>

                        <div className="text-right shrink-0">
                            <div className="font-bold text-gray-900">R$ {stock.price?.toFixed(2)}</div>
                            <div className="text-xs font-bold text-emerald-600">{userPersonalScore} pts</div>
                        </div>
                    </div>
                 </div>
              )})}
            </div>
            <div className="text-center text-[10px] text-gray-400 mt-4">Dados de mercado: Brapi. | Scores ESG: B3 (ISE, ICO2, IDIVERSA).</div>
          </div>
        )}
      </main>

      {/* MENU INFERIOR */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-8 z-30">
        <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center gap-1 transition-all ${activeTab === "home" ? "text-emerald-400 scale-110" : "text-gray-400 hover:text-white"}`}><Home size={22} /><span className="text-[10px] font-medium">Início</span></button>
        <button onClick={() => setActiveTab("portfolio")} className={`flex flex-col items-center gap-1 transition-all ${activeTab === "portfolio" ? "text-emerald-400 scale-110" : "text-gray-400 hover:text-white"}`}><Briefcase size={22} /><span className="text-[10px] font-medium">Carteira</span></button>
        <button onClick={() => setActiveTab("market")} className={`flex flex-col items-center gap-1 transition-all ${activeTab === "market" ? "text-emerald-400 scale-110" : "text-gray-400 hover:text-white"}`}><Compass size={22} /><span className="text-[10px] font-medium">Explorar</span></button>
      </nav>

      {isAddModalOpen && <AddTransactionModal stocks={STOCKS_DB} onClose={() => setIsAddModalOpen(false)} onSave={handleAddTransaction} initialType={transactionModalType} />}
      
      {selectedStock && (
        <StockModal
          stock={selectedStock}
          user={userProfile}
          coherenceScore={selectedStock.coherenceScore || 0}
          onClose={() => setSelectedStock(null)}
        />
      )}

      {isCustomStrategyOpen && <CustomStrategyModal currentTargets={userProfile.customTargets || { fixed_income: 40, fii: 30, stock: 30 }} onClose={() => setIsCustomStrategyOpen(false)} onSave={handleSaveCustomStrategy} />}
      {isMethodologyOpen && <MethodologyModal onClose={() => setIsMethodologyOpen(false)} />}
    </div>
  );
}
