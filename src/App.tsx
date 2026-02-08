import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Briefcase,
  Compass,
  Home,
  Leaf,
  Loader2,
  ShieldCheck,
  Info,
  AlertCircle
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

// --- DICIONÁRIO MESTRE DE NOMES B3 ---
const STOCK_NAMES_FIX: Record<string, string> = {
  "VALE3": "Vale S.A.", "PETR4": "Petrobras PN", "PETR3": "Petrobras ON",
  "ITUB4": "Itaú Unibanco", "BBDC4": "Bradesco PN", "BBDC3": "Bradesco ON",
  "BBAS3": "Banco do Brasil", "WEGE3": "WEG S.A.", "ABEV3": "Ambev",
  "MGLU3": "Magazine Luiza", "JBSS3": "JBS", "SUZB3": "Suzano",
  "GGBR4": "Gerdau PN", "RENT3": "Localiza", "LREN3": "Lojas Renner",
  "PRIO3": "Prio (PetroRio)", "HAPV3": "Hapvida", "RDOR3": "Rede D'Or",
  "RAIL3": "Rumo Logística", "ELET3": "Eletrobras ON", "ELET6": "Eletrobras PNB",
  "B3SA3": "B3 S.A.", "BPAC11": "BTG Pactual", "SANB11": "Santander Brasil",
  "VIVT3": "Vivo Telefônica", "TIMS3": "TIM Brasil", "CSAN3": "Cosan",
  "AMER3": "Americanas", "VIIA3": "Grupo Casas Bahia", "AZUL4": "Azul Linhas Aéreas",
  "GOLL4": "Gol Linhas Aéreas", "OIBR3": "Oi S.A.", "CASH3": "Méliuz"
};

// --- COMPONENTE DE LOGO ---
const StockLogo = ({ ticker, size = "md" }: { ticker: string, size?: "sm" | "md" | "lg" }) => {
  const [errorCount, setErrorCount] = useState(0);
  if (!ticker || typeof ticker !== 'string') return <div className="w-10 h-10 bg-gray-100 rounded-lg" />;

  const sources = [
    `https://raw.githubusercontent.com/thecapybara/br-logos/main/logos/${ticker.toUpperCase()}.png`,
    `https://raw.githubusercontent.com/lbcosta/b3-logos/main/png/${ticker.toUpperCase()}.png`
  ];
  const sizeClasses = { sm: "w-8 h-8 text-[10px]", md: "w-10 h-10 text-xs", lg: "w-14 h-14 text-sm" };

  if (errorCount >= sources.length) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center border border-emerald-100 select-none`}>
        {ticker.substring(0, 2)}
      </div>
    );
  }
  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-white flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm p-0.5`}>
      <img src={sources[errorCount]} alt={ticker} className="w-full h-full object-contain" onError={() => setErrorCount(prev => prev + 1)} />
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [showValues, setShowValues] = useState(true);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "", goal: null, esgImportance: 0.5, riskProfile: null, isOnboardingComplete: false,
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try { return JSON.parse(localStorage.getItem("transactions") || "[]"); } catch { return []; }
  });

  const [knownStocks, setKnownStocks] = useState<any[]>(STOCKS_DB);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<"BUY" | "SELL">("BUY");
  const [selectedStock, setSelectedStock] = useState<any | null>(null);
  const [isCustomStrategyOpen, setIsCustomStrategyOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  // Inicializa com knownStocks para não ficar vazio
  const [marketStocks, setMarketStocks] = useState<any[]>(STOCKS_DB);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEsgOnly, setFilterEsgOnly] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const [esgMap, setEsgMap] = useState<Record<string, EsgScoreData>>({});
  const [isEsgMapLoaded, setIsEsgMapLoaded] = useState(false);

  useEffect(() => {
    MarketService.getEsgScores()
      .then(map => { setEsgMap(map); setIsEsgMapLoaded(true); })
      .catch(err => console.error("Erro ESG:", err));
  }, []);

  // --- BUSCA (ANTI-CRASH) ---
  useEffect(() => {
    if (activeTab === "market") {
      setSearchError(false);
      
      if (searchTerm.trim() === "") {
        // Se vazio, usa a lista conhecida (RESTAUROU A LISTA GRANDE)
        setMarketStocks(knownStocks); 
        setIsLoadingMarket(false);
        return;
      }

      const delayDebounceFn = setTimeout(() => {
        setIsLoadingMarket(true);
        MarketService.searchStocks(searchTerm)
          .then(data => {
             if (data.length > 0) setMarketStocks(data);
             else setMarketStocks([]); 
          })
          .catch(err => {
             console.error("Erro busca:", err);
             setSearchError(true);
             setMarketStocks([]);
          })
          .finally(() => setIsLoadingMarket(false));
      }, 600);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [activeTab, searchTerm, knownStocks]);

  // --- CÁLCULO DE NOTA (CORREÇÃO DE MATCH + FOLHA VERDE) ---
  const getEsgData = (ticker: string) => {
    if (!ticker) return { score: 50, badges: [] };
    const cleanTicker = ticker.replace('.SA', '').trim().toUpperCase();
    // Tenta achar com a chave limpa (WEGE3) ou original
    return esgMap[cleanTicker] || esgMap[ticker] || { score: 50, badges: [] };
  };

  const calculateLivoScore = (stock: any, assetType: string, esgWeight: number) => {
    if (assetType === 'fixed_income') return 60;

    const esgData = getEsgData(stock.ticker);
    const esgScore = esgData.score;

    let financialScore = 60; 
    if (stock.change > 0) financialScore = 70;
    if (stock.change < 0) financialScore = 50;

    const score = (esgScore * esgWeight) + (financialScore * (1 - esgWeight));
    return Math.round(score);
  };

  const holdings = useMemo(() => {
    const map = new Map<string, { qty: number; totalCost: number }>();
    transactions.forEach((t) => {
      const current = map.get(t.ticker) || { qty: 0, totalCost: 0 };
      if (t.type === "BUY") { 
        map.set(t.ticker, { qty: current.qty + t.quantity, totalCost: current.totalCost + (t.quantity * t.price) }); 
      } else { 
        const avgPrice = current.qty > 0 ? current.totalCost / current.qty : 0;
        map.set(t.ticker, { qty: current.qty - t.quantity, totalCost: current.totalCost - (t.quantity * avgPrice) }); 
      }
    });

    const result: Holding[] = [];
    map.forEach((value, ticker) => {
      if (value.qty > 0.00001 || (value.totalCost > 0 && ticker === "FIXED")) {
        let stock = knownStocks.find((s) => s.ticker === ticker);
        const isFixedIncome = stock?.assetType === 'fixed_income' || ticker.includes("CDB") || ticker.includes("TESOURO");
        
        const currentPrice = stock ? stock.price : (value.totalCost / (value.qty || 1));
        const totalValue = isFixedIncome ? value.totalCost : (value.qty * currentPrice);

        const coherenceScore = calculateLivoScore(
          stock || { ticker, change: 0 }, 
          isFixedIncome ? 'fixed_income' : 'stock', 
          userProfile.esgImportance
        );

        result.push({
          ticker,
          assetType: isFixedIncome ? "fixed_income" : (stock?.assetType || "stock"),
          quantity: value.qty,
          averagePrice: value.qty > 0 ? value.totalCost / value.qty : 0,
          currentPrice: currentPrice,
          totalValue: totalValue,
          profit: totalValue - value.totalCost,
          profitPercent: value.totalCost > 0 ? ((totalValue - value.totalCost) / value.totalCost) * 100 : 0,
          allocationPercent: 0,
          // @ts-ignore
          individualScore: coherenceScore 
        });
      }
    });
    return result;
  }, [transactions, knownStocks, userProfile.esgImportance, esgMap]);

  const rankedStocks = useMemo(() => {
    return knownStocks.map((stock) => {
      const score = calculateLivoScore(stock, stock.assetType, userProfile.esgImportance);
      return { ...stock, coherenceScore: score };
    }).sort((a, b) => b.coherenceScore - a.coherenceScore);
  }, [userProfile, knownStocks, esgMap]);

  // --- LISTA DE MERCADO ---
  const displayedStocks = useMemo(() => {
    const safeStocks = Array.isArray(marketStocks) ? marketStocks : [];
    
    const enriched = safeStocks.map(stock => {
      const b3Data = getEsgData(stock.ticker);
      
      let displayName = STOCK_NAMES_FIX[stock.ticker] || stock.name || stock.ticker;
      if (displayName && displayName.endsWith('.SA')) displayName = displayName.replace('.SA', '');
      
      const evidence = b3Data.evidence_log || (b3Data.score === 50 ? [{ type: 'BASE', desc: 'Nota Inicial Neutra', val: 50 }] : []);

      return { 
        ...stock, 
        ...b3Data, 
        evidence_log: evidence, 
        name: displayName,
        score: b3Data.score 
      };
    });
    // FILTRO ESG REFORÇADO: Só mostra quem tem nota acima da base (50)
    return enriched.filter(stock => !filterEsgOnly || stock.score > 55);
  }, [marketStocks, filterEsgOnly, esgMap]);

  const handleAddTransaction = (t: Omit<Transaction, "id">, extraStockData?: any) => {
    const updated = [...transactions, { ...t, id: Math.random().toString(36).substr(2, 9) }];
    setTransactions(updated);
    localStorage.setItem("transactions", JSON.stringify(updated));

    if (extraStockData) {
      setKnownStocks(prev => {
        const exists = prev.find(s => s.ticker === extraStockData.ticker);
        if (exists) return prev;
        return [...prev, {
            ...extraStockData,
            esgScore: extraStockData.esgScore || 50,
            financialScore: 60,
            assetType: extraStockData.assetType || (extraStockData.stock?.endsWith('11') ? 'fii' : 'stock')
        }];
      });
    }
  };

  const handleDeleteAsset = (ticker: string) => {
    if (confirm(`Remover ${ticker} do histórico?`)) {
      const updated = transactions.filter((t) => t.ticker !== ticker);
      setTransactions(updated);
      localStorage.setItem("transactions", JSON.stringify(updated));
    }
  };

  const openBuyModal = () => { setTransactionModalType("BUY"); setIsAddModalOpen(true); };
  const openSellModal = () => { setTransactionModalType("SELL"); setIsAddModalOpen(true); };
  const handleRetakeOnboarding = () => { if(window.confirm("Refazer perfil?")) setUserProfile(prev => ({ ...prev, isOnboardingComplete: false })); };
  const handleSaveCustomStrategy = (targets: any) => { setUserProfile((prev) => ({ ...prev, riskProfile: "Personalizado", customTargets: targets })); setIsCustomStrategyOpen(false); };

  if (!userProfile.isOnboardingComplete) return <Onboarding onComplete={setUserProfile} />;

  return (
    <div className="max-w-5xl mx-auto bg-[#F9FAFB] min-h-screen relative shadow-2xl border-x border-gray-200">
      
      <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-white sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-auto max-w-[120px] flex items-center justify-start overflow-hidden">
             <img 
               src="/logo.png" 
               alt="Livo Logo" 
               className="h-full w-auto object-contain"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.parentElement!.innerHTML = `<div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></div>`;
               }}
             />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none hidden">Livo</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider pl-1">
              {userProfile.riskProfile === "Personalizado" ? "Estratégia Própria" : userProfile.goal || "Investidor Consciente"}
            </p>
          </div>
        </div>
        <button onClick={() => { if (window.confirm("Resetar TUDO?")) { localStorage.clear(); window.location.reload(); } }} className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors">
          Sair / Resetar
        </button>
      </header>

      <main className="p-6">
        {activeTab === "home" && <HomeTab userProfile={userProfile} transactions={transactions} onAddTransaction={openBuyModal} showValues={showValues} onToggleValues={() => setShowValues(!showValues)} holdings={holdings} rankedStocks={rankedStocks} />}
        {activeTab === "portfolio" && <PortfolioDashboard userProfile={userProfile} transactions={transactions} onAddTransaction={openBuyModal} onSellTransaction={openSellModal} onRetakeOnboarding={handleRetakeOnboarding} onOpenCustomStrategy={() => setIsCustomStrategyOpen(true)} onDeleteAsset={handleDeleteAsset} onDeleteTransaction={() => {}} rankedStocks={rankedStocks} showValues={showValues} />}

        {activeTab === "market" && (
          <div className="space-y-4 pb-32 animate-in fade-in">
            <div className="sticky top-20 z-10 space-y-2">
               <button onClick={() => setIsMethodologyOpen(true)} className="w-full bg-emerald-900/5 hover:bg-emerald-900/10 border border-emerald-900/10 p-3 rounded-xl flex items-center justify-between group transition-all">
                 <div className="flex items-center gap-2">
                   <div className="bg-white p-1.5 rounded-lg shadow-sm"><ShieldCheck size={16} className="text-emerald-700" /></div>
                   <div className="text-left"><p className="text-xs font-bold text-gray-800 group-hover:text-emerald-800">Como calculamos a Nota Livo?</p><p className="text-[10px] text-gray-500">Conheça os critérios da B3 que usamos.</p></div>
                 </div>
                 <Info size={14} className="text-gray-400 group-hover:text-emerald-600" />
               </button>

               <div className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-2 shadow-sm">
                  <Search className="text-gray-400" />
                  <input type="text" placeholder="Buscar na B3 (ex: WEGE3, ITAU...)" className="w-full outline-none text-sm bg-transparent" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  {isLoadingMarket && <Loader2 className="animate-spin text-emerald-500" size={20} />}
               </div>
               
               <div className="flex justify-end items-center gap-2">
                 {!isEsgMapLoaded && <span className="text-[10px] text-gray-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> Sincronizando B3...</span>}
                 <button onClick={() => setFilterEsgOnly(!filterEsgOnly)} className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all border ${filterEsgOnly ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-white text-gray-500 border-gray-200 hover:border-emerald-200"}`}>
                   <Leaf size={12} fill={filterEsgOnly ? "currentColor" : "none"} /> Apenas Destaques ESG
                 </button>
               </div>
            </div>

            <div className="space-y-3">
              {!isLoadingMarket && searchError && (
                 <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm justify-center">
                   <AlertCircle size={16} /> Falha na conexão. Tente novamente.
                 </div>
              )}

              {displayedStocks.length === 0 && !isLoadingMarket && !searchError && (
                <div className="text-center py-10">
                   <p className="text-gray-400 mb-2">Nenhum ativo encontrado.</p>
                </div>
              )}

              {displayedStocks.map((stock) => (
                 <div key={stock.ticker} onClick={() => {
                      const fullStockData = { ...stock, coherenceScore: stock.score, tags: stock.badges };
                      if (!knownStocks.find(s => s.ticker === stock.ticker)) {
                          setKnownStocks(prev => [...prev, fullStockData]);
                      }
                      setSelectedStock(fullStockData);
                   }}
                   className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all"
                 >
                    <div className="flex items-center gap-3 w-full">
                        <div className="shrink-0"><StockLogo ticker={stock.ticker} size="md" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                             <h4 className="font-bold text-gray-900">{stock.ticker}</h4>
                             {/* CORREÇÃO FOLHA VERDE: SÓ APARECE SE > 55 */}
                             {stock.score > 55 && <Leaf size={12} className="text-emerald-500" fill="currentColor"/>}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{stock.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <div className="font-bold text-gray-900">R$ {stock.price?.toFixed(2)}</div>
                            <div className={`text-xs font-bold ${stock.score > 55 ? "text-emerald-600" : "text-gray-400"}`}>{stock.score} pts</div>
                        </div>
                    </div>
                 </div>
              ))}
            </div>
            <div className="text-center text-[10px] text-gray-400 mt-4">Dados: Brapi. | Scores: B3 + Dossiê Livo.</div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-8 z-30">
        <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center gap-1 transition-all ${activeTab === "home" ? "text-emerald-400 scale-110" : "text-gray-400 hover:text-white"}`}><Home size={22} /><span className="text-[10px] font-medium">Início</span></button>
        <button onClick={() => setActiveTab("portfolio")} className={`flex flex-col items-center gap-1 transition-all ${activeTab === "portfolio" ? "text-emerald-400 scale-110" : "text-gray-400 hover:text-white"}`}><Briefcase size={22} /><span className="text-[10px] font-medium">Carteira</span></button>
        <button onClick={() => setActiveTab("market")} className={`flex flex-col items-center gap-1 transition-all ${activeTab === "market" ? "text-emerald-400 scale-110" : "text-gray-400 hover:text-white"}`}><Compass size={22} /><span className="text-[10px] font-medium">Explorar</span></button>
      </nav>

      {isAddModalOpen && <AddTransactionModal stocks={knownStocks} onClose={() => setIsAddModalOpen(false)} onSave={handleAddTransaction} initialType={transactionModalType} />}
      {selectedStock && <StockModal stock={selectedStock} user={userProfile} coherenceScore={selectedStock.coherenceScore || 0} onClose={() => setSelectedStock(null)} />}
      {isCustomStrategyOpen && <CustomStrategyModal currentTargets={userProfile.customTargets || { fixed_income: 40, fii: 30, stock: 30 }} onClose={() => setIsCustomStrategyOpen(false)} onSave={handleSaveCustomStrategy} />}
      {isMethodologyOpen && <MethodologyModal onClose={() => setIsMethodologyOpen(false)} />}
    </div>
  );
}
