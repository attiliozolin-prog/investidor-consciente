import React, { useState, useMemo } from "react";
import {
  Search,
  Leaf,
  User,
  Briefcase,
  Compass,
  AlertTriangle,
  Home,
  Plus,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Target,
  Newspaper,
  ExternalLink,
  Trash2,
  History,
} from "lucide-react";

import Onboarding from "./components/onboarding";
import Tooltip from "./components/common/Tooltip";
import MetricBox from "./components/common/MetricBox";
import TransactionHistoryModal from "./components/modals/TransactionHistoryModal";
import AddTransactionModal from "./components/modals/AddTransactionModal";
import StockModal from "./components/modals/StockModal";
import HomeTab from "./components/layout/tabs/HomeTab";
import PortfolioDashboard from "./components/layout/tabs/PortfolioDashboard";
import { Transaction, Holding } from "./types";

// --- IMPORTAÇÃO DA NOVA INTELIGÊNCIA ARTIFICIAL ---
import { IA } from './IA'; 

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export enum InvestmentGoal {
  RESERVE = "Reserva de Emergência",
  RETIREMENT = "Aposentadoria",
  REAL_ESTATE = "Compra de Imóvel",
  WEALTH = "Construção de Patrimônio",
}

export enum RiskProfile {
  CONSERVATIVE = "Conservador",
  MODERATE = "Moderado",
  BOLD = "Arrojado",
}

export interface UserProfile {
  name: string;
  goal: InvestmentGoal | null;
  esgImportance: number; // 0.0 to 1.0 (Slider)
  riskProfile: RiskProfile | null;
  isOnboardingComplete: boolean;
}

// ==========================================
// 2. MOCK DATA (STOCKS_DB & GLOSSARY)
// ==========================================

type StockData = {
  ticker: string;
  name: string;
  sector: string;
  assetType: "stock" | "fii" | "fixed_income";
  price: number;
  financialScore: number;
  esgScore: number;
  dividendYield: number;
  peRatio: number;
  roe: number;
  volatility: "Baixa" | "Média" | "Alta" | "Muito Alta";
  tags: string[];
  description: string;
  esgHighlight: string;
  riskReason?: string;
};

const STOCKS_DB: StockData[] = [
  // --- STOCKS ---
  {
    ticker: "WEG3",
    name: "WEG S.A.",
    sector: "Bens Industriais",
    assetType: "stock",
    price: 40.5,
    financialScore: 95,
    esgScore: 92,
    dividendYield: 1.5,
    peRatio: 32.5,
    roe: 28,
    volatility: "Média",
    tags: ["Crescimento Sustentável", "ESG Leader", "Global"],
    description:
      "Multinacional brasileira líder em motores elétricos e energia renovável. Historicamente uma das empresas mais consistentes da bolsa.",
    esgHighlight:
      "Forte atuação em descarbonização e eficiência energética. Governança exemplar.",
  },
  {
    ticker: "BBAS3",
    name: "Banco do Brasil",
    sector: "Financeiro",
    assetType: "stock",
    price: 58.2,
    financialScore: 88,
    esgScore: 75,
    dividendYield: 9.2,
    peRatio: 4.5,
    roe: 22,
    volatility: "Média",
    tags: ["Estatal Sólida", "Dividendos", "Agro"],
    description:
      "Um dos maiores bancos do país, com lucros recordes e forte ligação com o desenvolvimento nacional via agronegócio.",
    esgHighlight:
      "Liderança em crédito verde e função social clara, apesar de riscos de interferência política (Governança).",
  },
  {
    ticker: "EGIE3",
    name: "Engie Brasil",
    sector: "Utilidade Pública",
    assetType: "stock",
    price: 42.1,
    financialScore: 85,
    esgScore: 90,
    dividendYield: 6.5,
    peRatio: 10.2,
    roe: 18,
    volatility: "Baixa",
    tags: ["Energia Limpa", "Dividendos", "Defensiva"],
    description:
      "A maior produtora privada de energia do Brasil, com foco total em fontes renováveis.",
    esgHighlight:
      "Matriz energética quase 100% renovável. Excelente histórico de relação com comunidades.",
  },
  {
    ticker: "KLBN11",
    name: "Klabin",
    sector: "Materiais Básicos",
    assetType: "stock",
    price: 22.4,
    financialScore: 78,
    esgScore: 88,
    dividendYield: 5.8,
    peRatio: 8.5,
    roe: 15,
    volatility: "Média",
    tags: ["Economia Circular", "Exportadora", "Dividendos"],
    description:
      "Maior produtora e exportadora de papéis do Brasil, referência mundial em sustentabilidade florestal.",
    esgHighlight:
      "Manejo florestal certificado e balanço de carbono positivo (sequestra mais do que emite).",
  },
  {
    ticker: "ITUB4",
    name: "Itaú Unibanco",
    sector: "Financeiro",
    assetType: "stock",
    price: 33.8,
    financialScore: 92,
    esgScore: 70,
    dividendYield: 4.5,
    peRatio: 9.0,
    roe: 20,
    volatility: "Baixa",
    tags: ["Blue Chip", "Líder de Mercado", "Consistência"],
    description:
      "O maior banco privado do hemisfério sul. Sinônimo de solidez financeira e gestão conservadora.",
    esgHighlight:
      "Forte agenda social (Fundação Itaú) e compromisso Net Zero, mas exposição a setores poluentes.",
  },
  {
    ticker: "RAIL3",
    name: "Rumo",
    sector: "Logística",
    assetType: "stock",
    price: 21.5,
    financialScore: 70,
    esgScore: 82,
    dividendYield: 0.5,
    peRatio: 25.0,
    roe: 8,
    volatility: "Alta",
    tags: ["Infraestrutura", "Eficiência", "Crescimento"],
    description:
      "Operadora logística ferroviária, essencial para o escoamento da produção agrícola brasileira.",
    esgHighlight:
      "Ferrovias emitem 7x menos CO2 que caminhões. Projeto vital para a eficiência nacional.",
  },
  {
    ticker: "VALE3",
    name: "Vale",
    sector: "Materiais Básicos",
    assetType: "stock",
    price: 60.5,
    financialScore: 80,
    esgScore: 45,
    dividendYield: 8.5,
    peRatio: 5.2,
    roe: 18,
    volatility: "Alta",
    tags: ["Commodities", "Dividendos", "Risco ESG"],
    description:
      "Uma das maiores mineradoras do mundo. Geradora massiva de caixa, mas carrega histórico de desastres ambientais.",
    esgHighlight:
      "Investindo bilhões em reparação e segurança, mas o passivo ambiental (E) ainda penaliza a nota.",
    riskReason: "Alto risco ambiental e dependência da China.",
  },
  {
    ticker: "MGLU3",
    name: "Magalu",
    sector: "Varejo",
    assetType: "stock",
    price: 2.1,
    financialScore: 40,
    esgScore: 88,
    dividendYield: 0.0,
    peRatio: -15.0,
    roe: -2,
    volatility: "Muito Alta",
    tags: ["Turnaround", "Inclusão Digital", "Liderança Feminina"],
    description:
      "Varejista nacional focada em digitalização. Passa por momento financeiro delicado.",
    esgHighlight:
      "Referência absoluta em liderança feminina (Luiza Trajano), combate ao racismo e inclusão digital.",
  },

  // --- FIIs (Real Estate Funds) ---
  {
    ticker: "HGLG11",
    name: "CSHG Logística",
    sector: "FII Logístico",
    assetType: "fii",
    price: 165.0,
    financialScore: 92,
    esgScore: 85,
    dividendYield: 9.0,
    peRatio: 1.05,
    roe: 10,
    volatility: "Baixa",
    tags: ["Galpões", "Renda Mensal", "Segurança"],
    description:
      "Um dos FIIs mais tradicionais do mercado, focado em galpões logísticos de alto padrão.",
    esgHighlight:
      "Imóveis com certificação verde (LEED) e gestão transparente.",
  },
  {
    ticker: "KNRI11",
    name: "Kinea Renda",
    sector: "FII Híbrido",
    assetType: "fii",
    price: 158.5,
    financialScore: 90,
    esgScore: 80,
    dividendYield: 8.5,
    peRatio: 1.02,
    roe: 9,
    volatility: "Baixa",
    tags: ["Lajes e Galpões", "Diversificação", "Gestão Kinea"],
    description:
      "Fundo híbrido com portfólio robusto de escritórios e galpões. Grande diversificação de inquilinos.",
    esgHighlight: "Retrofit de prédios antigos para eficiência energética.",
  },

  // --- FIXED INCOME ---
  {
    ticker: "TESOURO_SELIC",
    name: "Tesouro Selic 2029",
    sector: "Renda Fixa",
    assetType: "fixed_income",
    price: 14500.0,
    financialScore: 99,
    esgScore: 90,
    dividendYield: 11.25,
    peRatio: 0,
    roe: 0,
    volatility: "Baixa",
    tags: ["Risco Soberano", "Liquidez Diária", "Reserva"],
    description:
      "O investimento mais seguro do país. Ideal para reserva de emergência.",
    esgHighlight:
      "Financiamento da dívida pública e serviços essenciais do estado.",
  },
  {
    ticker: "CDB",
    name: "CDB",
    sector: "Renda Fixa Privada",
    assetType: "fixed_income",
    price: 1000.0,
    financialScore: 85,
    esgScore: 98,
    dividendYield: 12.0,
    peRatio: 0,
    roe: 0,
    volatility: "Baixa",
    tags: ["Impacto Positivo", "Isento IR", "Projetos Verdes"],
    description: "Título de renda fixa emitidos pelos mais diversos bancos.",
    esgHighlight: "Segurado pelo FGC em aplicações de até R$ 250 mil.",
  },
];

type GlossaryTerm = {
  term: string;
  definition: string;
  example?: string;
};

const GLOSSARY: GlossaryTerm[] = [
  {
    term: "Dividend Yield (DY)",
    definition:
      'É o "aluguel" que suas ações pagam. Mostra quanto a empresa pagou de proventos nos últimos 12 meses em relação ao preço da ação.',
  },
  {
    term: "P/L (Preço sobre Lucro)",
    definition:
      "O tempo (em anos) que você levaria para recuperar seu investimento apenas com os lucros da empresa. P/L alto pode indicar que a ação está cara.",
  },
  {
    term: "ROE (Retorno sobre Patrimônio)",
    definition:
      "Mede a eficiência da gestão. Quanto de lucro a empresa gera para cada real que os acionistas investiram nela.",
  },
  {
    term: "Volatilidade",
    definition:
      "O quanto o preço da ação costuma variar. Alta volatilidade significa mais emoção (e risco) no curto prazo.",
  },
  {
    term: "ESG",
    definition:
      "Environmental (Ambiental), Social e Governance (Governança). Mede se a empresa é sustentável, ética e cuida das pessoas.",
  },
];

const MOCK_NEWS = [
  {
    title:
      "Setor de Energia Renovável cresce 15% no trimestre impulsionado por novos investimentos em eólica.",
    source: "InfoMoney",
    url: "#",
  },
  {
    title:
      "Bancos aumentam carteira de crédito verde para financiar transição energética da indústria.",
    source: "Valor Econômico",
    url: "#",
  },
  {
    title:
      "Fundos Imobiliários de Papel: Como a inflação atual impacta seus dividendos mensais.",
    source: "Suno Research",
    url: "#",
  },
];

// ==========================================
// 3. HELPER COMPONENTS
// ==========================================

const LogoIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ filter: "drop-shadow(0px 2px 4px rgba(5, 150, 105, 0.2))" }}
  >
    <rect width="48" height="48" rx="12" fill="#059669" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11 36V24H17V36H11ZM21 36V16H27V36H21ZM31 36V8H37V36H31Z"
      fill="white"
    />
  </svg>
);

// ==========================================
// 6. MAIN APP COMPONENT
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [showValues, setShowValues] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStockTicker, setSelectedStockTicker] = useState<string | null>(
    null
  );

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
        result.push({
          ticker,
          assetType: stock?.assetType || "stock",
          quantity: value.qty,
          averagePrice: value.qty > 0 ? value.totalCost / value.qty : 0,
          currentPrice,
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
    setTransactions([
      ...transactions,
      { ...t, id: Math.random().toString(36).substr(2, 9) },
    ]);
  };

  const handleDeleteAsset = (ticker: string) => {
    if (
      confirm(`Tem certeza que deseja remover todo o histórico de ${ticker}?`)
    ) {
      setTransactions(transactions.filter((t) => t.ticker !== ticker));
    }
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
              {userProfile.goal}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (
              window.confirm("Resetar o App? Isso apagará todos os seus dados.")
            ) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="text-xs font-bold text-red-600 bg-red-100 px-3 py-2 rounded-md hover:bg-red-200 transition-colors"
        >
          Resetar
        </button>
      </header>

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
            onDeleteTransaction={(id: string) =>
              setTransactions(transactions.filter((t) => t.id !== id))
            }
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

{isAddModalOpen && (
  <AddTransactionModal
    stocks={STOCKS_DB}
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

