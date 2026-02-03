// ================================
// TIPOS GLOBAIS DO INVESTIDOR CONSCIENTE
// ================================

// --------------------------------
// OBJETIVOS DE INVESTIMENTO
// --------------------------------
export enum InvestmentGoal {
  RESERVE = "Reserva de Emergência",
  RETIREMENT = "Aposentadoria",
  REAL_ESTATE = "Compra de Imóvel",
  WEALTH = "Construção de Patrimônio",
}

// --------------------------------
// PERFIL DE RISCO
// --------------------------------
export enum RiskProfile {
  CONSERVATIVE = "Conservador",
  MODERATE = "Moderado",
  BOLD = "Arrojado",
}

// --------------------------------
// PERFIL DO USUÁRIO
// --------------------------------
export interface UserProfile {
  name: string;
  goal: InvestmentGoal | null;
  esgImportance: number; // 0.0 a 1.0
  riskProfile: RiskProfile | null;
  isOnboardingComplete: boolean;

  // Informação importante para o futuro
  experienceLevel?: "iniciante" | "intermediario" | "experiente";
}

// --------------------------------
// TIPOS DE ATIVOS
// --------------------------------
export type AssetType = "stock" | "fii" | "fixed_income";

// --------------------------------
// DADOS DE UM ATIVO (AÇÃO, FII, RENDA FIXA)
// --------------------------------
export interface StockData {
  ticker: string;
  name: string;
  sector: string;
  assetType: AssetType;

  price: number;

  // Métricas
  financialScore: number; // 0-100
  esgScore: number; // 0-100
  dividendYield: number;
  peRatio: number; // P/L
  roe: number;

  volatility: "Baixa" | "Média" | "Alta" | "Muito Alta";

  tags: string[];
  description: string;
  esgHighlight: string;

  // Opcional: alerta de risco
  riskReason?: string;
}

// --------------------------------
// TERMO DO GLOSSÁRIO
// --------------------------------
export interface GlossaryTerm {
  term: string;
  definition: string;
}

// --------------------------------
// TRANSAÇÃO DO USUÁRIO
// --------------------------------
export interface Transaction {
  id: string;
  ticker: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  date: string;
}

// --------------------------------
// ATIVO CONSOLIDADO NA CARTEIRA
// --------------------------------
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

// --------------------------------
// SUGESTÃO DE APORTE INTELIGENTE (IA)
// --------------------------------
export interface SmartSuggestion {
  ticker: string;
  qty: number;
  cost: number;
  reason: string;
}
