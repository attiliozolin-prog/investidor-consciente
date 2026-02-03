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

