import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  Leaf,
  Sprout,
  TreeDeciduous,
  User,
  Briefcase,
  Compass,
  Info,
  AlertTriangle,
  Home,
  Plus,
  X,
  Calendar,
  DollarSign,
  Hash,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  Newspaper,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  Wallet,
  Layers,
  RefreshCcw,
  Coins,
  Trash2,
  Check,
  History,
  Settings,
  HelpCircle,
  ArrowRight,
  HeartHandshake,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import Onboarding from "./components/onboarding";
import Tooltip from "./components/common/Tooltip";
import MetricBox from "./components/common/MetricBox";
import TransactionHistoryModal from "./components/modals/TransactionHistoryModal";
import AddTransactionModal from "./components/modals/AddTransactionModal";

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

export type AssetType = "stock" | "fii" | "fixed_income";

export interface StockData {
  ticker: string;
  name: string;
  sector: string;
  assetType: AssetType;
  price: number;
  financialScore: number; // 0-100
  esgScore: number; // 0-100
  dividendYield: number;
  peRatio: number; // P/L
  roe: number;
  volatility: "Baixa" | "Média" | "Alta" | "Muito Alta";
  tags: string[];
  description: string;
  esgHighlight: string;
  riskReason?: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface Transaction {
  id: string;
  ticker: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  date: string;
}

export interface Holding {
  ticker: string;
  assetType: AssetType;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profit: number;
  profitPercent: number;
  allocationPercent: number;
}

// ==========================================
// 2. MOCK DATA (STOCKS_DB & GLOSSARY)
// ==========================================

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
// 4. MODALS & SUB-COMPONENTS
// ==========================================

const StockModal: React.FC<{
  stock: StockData;
  user: UserProfile;
  coherenceScore: number;
  onClose: () => void;
}> = ({ stock, user, coherenceScore, onClose }) => {
  const isFixedIncome = stock.assetType === "fixed_income";
  const radarData = [
    { subject: "Financeiro", A: stock.financialScore, fullMark: 100 },
    {
      subject: "Ambiental",
      A: stock.esgScore > 50 ? stock.esgScore : stock.esgScore + 10,
      fullMark: 100,
    },
    { subject: "Social/Gov", A: stock.esgScore, fullMark: 100 },
    {
      subject: "Estabilidade",
      A:
        stock.volatility === "Baixa"
          ? 90
          : stock.volatility === "Média"
          ? 60
          : 30,
      fullMark: 100,
    },
  ];
  const isExpensive =
    !isFixedIncome && stock.peRatio > 30 && stock.assetType === "stock";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <div className="sticky top-0 bg-white/90 backdrop-blur z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {stock.ticker}
              </h2>
              <span className="text-sm text-gray-500 font-medium">
                {stock.name}
              </span>
            </div>
            <div className="flex gap-2 mt-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                {stock.assetType === "stock"
                  ? "Ação"
                  : stock.assetType === "fii"
                  ? "FII"
                  : "Renda Fixa"}
              </span>
              <span className="text-xs text-emerald-700 font-semibold">
                {stock.sector}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-8">
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-emerald-600 mt-1 shrink-0" />
              <div>
                <h3 className="font-bold text-emerald-900 text-lg mb-1">
                  Coerência com seu perfil: {coherenceScore.toFixed(0)}%
                </h3>
                <p className="text-emerald-800 text-sm leading-relaxed">
                  Baseado no seu foco em <strong>{user.goal}</strong> e sua
                  exigência {user.esgImportance > 0.6 ? "alta" : "moderada"} por
                  ESG.
                  {stock.esgScore > 80
                    ? " Esta empresa é líder em práticas sustentáveis."
                    : " Ativo alinhado com a estratégia de proteção e rendimentos."}
                </p>
              </div>
            </div>
          </div>
          {isExpensive && (
            <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200 flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 mt-1 shrink-0" />
              <div>
                <h3 className="font-bold text-yellow-800 text-sm mb-1">
                  Valuation Esticado
                </h3>
                <p className="text-yellow-700 text-xs">
                  O indicador P/L está acima de 30 ({stock.peRatio.toFixed(1)}).
                  Preço alto em relação ao lucro.
                </p>
              </div>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Sobre o ativo
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {stock.description}
              </p>
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf size={16} className="text-emerald-600" />
                  <span className="font-semibold text-sm text-emerald-900">
                    Destaque ESG
                  </span>
                </div>
                <p className="text-xs text-stone-600">{stock.esgHighlight}</p>
              </div>
              {stock.riskReason && (
                <div className="mt-3 bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-orange-600" />
                    <span className="font-semibold text-sm text-orange-900">
                      Ponto de Atenção
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">{stock.riskReason}</p>
                </div>
              )}
            </div>
            <div className="h-64 relative">
              {isFixedIncome ? (
                <div className="w-full h-full bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center p-6">
                  <ShieldCheck size={64} className="text-blue-500 mb-4" />
                  <h4 className="font-bold text-blue-900 text-lg mb-1">
                    Segurança & Liquidez
                  </h4>
                  <p className="text-blue-700 text-sm px-4">
                    Este ativo é focado em proteção de capital e baixo risco de
                    mercado.
                  </p>
                </div>
              ) : (
                <>
                  <h4 className="font-semibold text-gray-900 mb-2 absolute top-0 left-0 z-10">
                    Raio-X
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      data={radarData}
                    >
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={false}
                        axisLine={false}
                      />
                      <Radar
                        name={stock.ticker}
                        dataKey="A"
                        stroke="#059669"
                        strokeWidth={2}
                        fill="#059669"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              Indicadores Fundamentais
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricBox
                label="Preço Atual"
                value={`R$ ${stock.price.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}`}
              />
              <MetricBox
                label={isFixedIncome ? "Rentabilidade" : "Dividend Yield"}
                value={`${stock.dividendYield}%`}
                tooltip={
                  isFixedIncome
                    ? "Rentabilidade anual contratada."
                    : "Dividend Yield (DY)"
                }
                highlight={stock.dividendYield > 10}
              />
              {isFixedIncome ? (
                <>
                  <MetricBox
                    label="Liquidez"
                    value={
                      stock.volatility === "Baixa" ? "D+0/D+1" : "No Vencimento"
                    }
                    tooltip="Tempo para resgatar o dinheiro."
                  />
                  <MetricBox
                    label="Risco"
                    value="Baixo"
                    tooltip="Probabilidade de perda do capital investido."
                  />
                </>
              ) : (
                <>
                  <MetricBox
                    label="P/L"
                    value={stock.peRatio === 0 ? "-" : stock.peRatio.toFixed(1)}
                    tooltip="P/L (Preço sobre Lucro)"
                    highlight={isExpensive}
                  />
                  <MetricBox
                    label="ROE"
                    value={`${stock.roe}%`}
                    tooltip="ROE (Retorno sobre Patrimônio)"
                    highlight={stock.roe > 15}
                  />
                </>
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <button className="w-full bg-[#059669] hover:bg-[#047857] text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-emerald-200 active:scale-[0.98]">
              Simular Investimento em {stock.ticker}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-2">
              Isso o levará para sua corretora parceira (simulação).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-900">Nova Movimentação</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType("BUY")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                type === "BUY"
                  ? "bg-white text-emerald-600 shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Compra
            </button>
            <button
              type="button"
              onClick={() => setType("SELL")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                type === "SELL"
                  ? "bg-white text-red-600 shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Venda
            </button>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Ativo
            </label>
            <select
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
            >
              {STOCKS_DB.map((s) => (
                <option key={s.ticker} value={s.ticker}>
                  {s.ticker} -{" "}
                  {s.assetType === "fixed_income" ? "(Renda Fixa)" : s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isFixedIncome && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantidade
                </label>
                <div className="relative">
                  <Hash
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full pl-9 p-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="0"
                    required={!isFixedIncome}
                  />
                </div>
              </div>
            )}
            <div className={isFixedIncome ? "col-span-2" : ""}>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {isFixedIncome ? "Valor Total (R$)" : "Preço Unitário (R$)"}
              </label>
              <div className="relative">
                <DollarSign
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-9 p-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Data
            </label>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 p-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-[0.98] transition-all mt-4 ${
              type === "BUY"
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                : "bg-red-600 hover:bg-red-700 shadow-red-200"
            }`}
          >
            Confirmar
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 5. MAIN TAB COMPONENTS
// ==========================================

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
    const result: Holding[] = [];
    let totalPortfolioValue = 0;
    map.forEach((value, ticker) => {
      if (value.qty > 0 || (value.qty === 0 && value.totalCost > 0)) {
        if (value.qty <= 0 && value.totalCost <= 0) return;
        const stockInfo = STOCKS_DB.find((s) => s.ticker === ticker);
        const currentPrice = stockInfo ? stockInfo.price : 0;
        let totalValue =
          stockInfo?.assetType === "fixed_income"
            ? value.totalCost
            : value.qty * currentPrice;
        totalPortfolioValue += totalValue;
        result.push({
          ticker,
          assetType: stockInfo?.assetType || "stock",
          quantity: value.qty,
          averagePrice: value.qty > 0 ? value.totalCost / value.qty : 0,
          currentPrice:
            stockInfo?.assetType === "fixed_income"
              ? value.qty > 0
                ? value.totalCost / value.qty
                : 0
              : currentPrice,
          totalValue,
          profit: totalValue - value.totalCost,
          profitPercent:
            value.totalCost > 0
              ? ((totalValue - value.totalCost) / value.totalCost) * 100
              : 0,
          allocationPercent: 0,
        });
      }
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
  }, [transactions]);

  const totalBalance = holdings.reduce((acc, h) => acc + h.totalValue, 0);
  const totalInvested = holdings.reduce(
    (acc, h) => acc + h.quantity * h.averagePrice,
    0
  );
  const totalProfit = totalBalance - totalInvested;

  const getRiskTargets = (risk: RiskProfile | null) => {
    switch (risk) {
      case RiskProfile.CONSERVATIVE:
        return { fixed_income: 60, fii: 25, stock: 15 };
      case RiskProfile.BOLD:
        return { fixed_income: 10, fii: 30, stock: 60 };
      default:
        return { fixed_income: 30, fii: 40, stock: 30 };
    }
  };
  const targets = getRiskTargets(userProfile.riskProfile);
  const currentAllocation = useMemo(() => {
    const alloc: any = { fixed_income: 0, fii: 0, stock: 0 };
    holdings.forEach((h) => {
      if (h.assetType in alloc) alloc[h.assetType] += h.totalValue;
    });
    if (totalBalance === 0) return { fixed_income: 0, fii: 0, stock: 0 };
    return {
      fixed_income: (alloc.fixed_income / totalBalance) * 100,
      fii: (alloc.fii / totalBalance) * 100,
      stock: (alloc.stock / totalBalance) * 100,
    };
  }, [holdings, totalBalance]);

  const allocationDeviation =
    Math.abs(currentAllocation.fixed_income - targets.fixed_income) +
    Math.abs(currentAllocation.fii - targets.fii) +
    Math.abs(currentAllocation.stock - targets.stock);
  const isBalanced = allocationDeviation < 20;

  const handleCalculateContribution = () => {
    const amount = parseFloat(contributionAmount);
    if (!amount || amount <= 0) return;
    const gaps = {
      fixed_income: targets.fixed_income - currentAllocation.fixed_income,
      fii: targets.fii - currentAllocation.fii,
      stock: targets.stock - currentAllocation.stock,
    };
    const sortedGaps = Object.entries(gaps).sort(([, a], [, b]) => b - a);
    const priorityClass = sortedGaps[0][0] as AssetType;
    const priorityGap = sortedGaps[0][1];
    let targetAssets: any = [];
    let suggestionLabel = "";

    if (priorityGap > 0) {
      targetAssets = rankedStocks.filter(
        (s: any) => s.assetType === priorityClass
      );
      suggestionLabel =
        priorityClass === "fixed_income"
          ? "Foco: Renda Fixa"
          : priorityClass === "fii"
          ? "Foco: FIIs"
          : "Foco: Ações";
    } else {
      targetAssets = rankedStocks;
      suggestionLabel = "Foco: Diversificação Geral";
    }
    setSuggestionType(suggestionLabel);

    let remainingMoney = amount;
    const finalBuyList: any[] = [];
    const candidates = targetAssets.slice(0, 3);

    for (const item of candidates) {
      if (remainingMoney < item.price) continue;
      let qtyToBuy = 0;
      if (item.assetType === "fixed_income") {
        if (finalBuyList.length === 0) {
          qtyToBuy = 1;
          finalBuyList.push({
            ticker: item.ticker,
            qty: 1,
            cost: remainingMoney,
            reason: `Opção Segura`,
          });
          remainingMoney = 0;
          break;
        }
      } else {
        const maxAffordable = Math.floor(remainingMoney / item.price);
        qtyToBuy = Math.min(
          maxAffordable,
          Math.floor(amount / candidates.length / item.price) + 1
        );
        if (qtyToBuy > 0) {
          const cost = qtyToBuy * item.price;
          finalBuyList.push({
            ticker: item.ticker,
            qty: qtyToBuy,
            cost: cost,
            reason: `Top Ranking`,
          });
          remainingMoney -= cost;
        }
      }
    }
    setSmartSuggestion(finalBuyList);
  };
  const realAllocationData = holdings.map((h) => ({
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-32">
      {holdings.length > 0 && (
        <div
          onClick={() =>
            contributionSectionRef.current?.scrollIntoView({
              behavior: "smooth",
            })
          }
          className={`cursor-pointer ${
            isBalanced
              ? "bg-emerald-100 border-emerald-200"
              : "bg-orange-100 border-orange-200"
          } border p-4 rounded-3xl flex items-center gap-4 shadow-sm`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isBalanced
                ? "bg-emerald-200 text-emerald-700"
                : "bg-orange-200 text-orange-700"
            }`}
          >
            {isBalanced ? <Check size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div>
            <h3
              className={`font-bold text-sm ${
                isBalanced ? "text-emerald-900" : "text-orange-900"
              }`}
            >
              {isBalanced ? "Carteira Equilibrada" : "Rebalanceamento Sugerido"}
            </h3>
            <p
              className={`text-xs ${
                isBalanced ? "text-emerald-700" : "text-orange-800"
              }`}
            >
              {isBalanced ? "Tudo certo." : "Toque para corrigir."}
            </p>
          </div>
        </div>
      )}
      <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl shadow-gray-900/20">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
          <Wallet size={16} /> Patrimônio Total
        </div>
        <div className="text-4xl font-bold mb-6">
          {showValues
            ? `R$ ${totalBalance.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}`
            : "••••••••"}
        </div>
        <div className="grid grid-cols-2 gap-8 border-t border-gray-800 pt-4">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
              Investido
            </div>
            <div className="font-semibold text-xl text-gray-300">
              {showValues
                ? `R$ ${totalInvested.toLocaleString("pt-BR", {
                    minimumFractionDigits: 0,
                  })}`
                : "••••"}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
              Resultado
            </div>
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
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Layers size={20} className="text-emerald-500" />
          Alocação
        </h3>
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>Renda Fixa</span>
              <span>
                {currentAllocation.fixed_income.toFixed(1)}% /{" "}
                {targets.fixed_income}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{
                  width: `${Math.min(currentAllocation.fixed_income, 100)}%`,
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>FIIs</span>
              <span>
                {currentAllocation.fii.toFixed(1)}% / {targets.fii}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{ width: `${Math.min(currentAllocation.fii, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>Ações</span>
              <span>
                {currentAllocation.stock.toFixed(1)}% / {targets.stock}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${Math.min(currentAllocation.stock, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        ref={contributionSectionRef}
        className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-6 rounded-3xl shadow-sm relative overflow-hidden"
      >
        <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2 mb-2 relative z-10">
          <Coins className="text-emerald-600" /> Aporte Inteligente
        </h3>
        <p className="text-sm text-emerald-700 mb-4 relative z-10 max-w-xs">
          Nossa IA equilibra sua carteira.
        </p>
        <div className="flex gap-2 relative z-10">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
              R$
            </span>
            <input
              type="number"
              placeholder="0,00"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
            />
          </div>
          <button
            onClick={handleCalculateContribution}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 rounded-xl transition-colors font-bold shadow-lg shadow-emerald-200"
          >
            Calcular
          </button>
        </div>
        {smartSuggestion && (
          <div className="mt-6 bg-white/80 backdrop-blur rounded-2xl p-4 border border-emerald-100">
            <h4 className="text-sm font-bold text-gray-900 mb-3">
              {suggestionType}
            </h4>
            {smartSuggestion.map((item) => (
              <div
                key={item.ticker}
                className="flex justify-between items-center p-2 mb-2 bg-white rounded-lg border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    {item.ticker.substring(0, 3)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">
                      {item.qty}x {item.ticker}
                    </div>
                  </div>
                </div>
                <div className="font-bold text-emerald-700 text-sm">
                  R$ {item.cost.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-4">
        <button
          onClick={onAddTransaction}
          className="w-full py-4 border-2 border-dashed border-emerald-300 bg-emerald-50 rounded-2xl flex items-center justify-center gap-2 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors"
        >
          <Plus size={20} /> Adicionar Novo Ativo
        </button>
        {holdings.length > 0 && (
          <>
            <div className="flex justify-between items-center px-2 mt-4">
              <h3 className="font-bold text-gray-900">Seus Ativos</h3>
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
              >
                <History size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {holdings.map((h) => (
                <div
                  key={h.ticker}
                  className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        h.assetType === "fixed_income"
                          ? "bg-blue-50 text-blue-700"
                          : h.assetType === "fii"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {h.ticker.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{h.ticker}</h4>
                      <p className="text-xs text-gray-500">
                        {h.assetType === "fixed_income"
                          ? "Aplicação"
                          : `${h.quantity} cotas`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        {showValues ? `R$ ${h.totalValue.toFixed(0)}` : "••••"}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAsset(h.ticker);
                      }}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mt-8">
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={realAllocationData}
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {realAllocationData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
      {isHistoryOpen && (
        <TransactionHistoryModal
          transactions={transactions}
          onClose={() => setIsHistoryOpen(false)}
          onDelete={(id) => {
            if (onDeleteTransaction) onDeleteTransaction(id);
          }}
        />
      )}
    </div>
  );
};

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
