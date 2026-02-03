import { StockData } from "../types";

// ================================
// BASE DE ATIVOS — INVESTIDOR CONSCIENTE
// ================================

export const STOCKS_DB: StockData[] = [
  // ================================
  // AÇÕES
  // ================================
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
      "Multinacional brasileira líder em motores elétricos e soluções para energia renovável.",
    esgHighlight:
      "Atuação forte em descarbonização, eficiência energética e governança exemplar.",
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
    tags: ["Dividendos", "Estatal", "Agro"],
    description:
      "Um dos maiores bancos do país, com forte atuação no crédito rural e desenvolvimento nacional.",
    esgHighlight:
      "Liderança em crédito sustentável, mas com riscos de governança por ser estatal.",
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
    tags: ["Energia Limpa", "Defensiva", "Dividendos"],
    description:
      "Maior produtora privada de energia elétrica do Brasil, com foco em fontes renováveis.",
    esgHighlight:
      "Matriz quase 100% renovável e forte relacionamento com comunidades.",
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
    tags: ["Papel e Celulose", "Economia Circular"],
    description:
      "Maior produtora de papéis do Brasil e referência global em manejo florestal.",
    esgHighlight:
      "Florestas certificadas e balanço de carbono positivo.",
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
    tags: ["Blue Chip", "Consistência"],
    description:
      "Maior banco privado do hemisfério sul, reconhecido pela solidez financeira.",
    esgHighlight:
      "Agenda social forte, mas com exposição indireta a setores poluentes.",
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
    tags: ["Commodities", "Risco ESG"],
    description:
      "Uma das maiores mineradoras do mundo, altamente lucrativa e cíclica.",
    esgHighlight:
      "Investimentos em reparação ambiental, mas com histórico crítico.",
    riskReason:
      "Alto risco ambiental e dependência da demanda chinesa.",
  },
  {
    ticker: "MGLU3",
    name: "Magazine Luiza",
    sector: "Varejo",
    assetType: "stock",
    price: 2.1,
    financialScore: 40,
    esgScore: 88,
    dividendYield: 0,
    peRatio: -15,
    roe: -2,
    volatility: "Muito Alta",
    tags: ["Turnaround", "Inclusão Digital"],
    description:
      "Varejista digital brasileira em processo de reestruturação financeira.",
    esgHighlight:
      "Referência em diversidade, inclusão e liderança feminina.",
  },

  // ================================
  // FUNDOS IMOBILIÁRIOS (FIIs)
  // ================================
  {
    ticker: "HGLG11",
    name: "CSHG Logística",
    sector: "FII Logístico",
    assetType: "fii",
    price: 165,
    financialScore: 92,
    esgScore: 85,
    dividendYield: 9,
    peRatio: 1.05,
    roe: 10,
    volatility: "Baixa",
    tags: ["Galpões", "Renda Mensal"],
    description:
      "Fundo imobiliário focado em galpões logísticos de alto padrão.",
    esgHighlight:
      "Imóveis com certificação verde e contratos de longo prazo.",
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
    tags: ["Diversificação", "Gestão Kinea"],
    description:
      "Fundo híbrido com lajes corporativas e galpões logísticos.",
    esgHighlight:
      "Retrofit de imóveis para eficiência energética.",
  },

  // ================================
  // RENDA FIXA
  // ================================
  {
    ticker: "TESOURO_SELIC",
    name: "Tesouro Selic 2029",
    sector: "Renda Fixa",
    assetType: "fixed_income",
    price: 14500,
    financialScore: 99,
    esgScore: 90,
    dividendYield: 11.25,
    peRatio: 0,
    roe: 0,
    volatility: "Baixa",
    tags: ["Liquidez", "Reserva"],
    description:
      "Título público ideal para reserva de emergência.",
    esgHighlight:
      "Financia serviços públicos e infraestrutura nacional.",
  },
  {
    ticker: "CDB",
    name: "CDB Bancário",
    sector: "Renda Fixa Privada",
    assetType: "fixed_income",
    price: 1000,
    financialScore: 85,
    esgScore: 98,
    dividendYield: 12,
    peRatio: 0,
    roe: 0,
    volatility: "Baixa",
    tags: ["FGC", "Projetos Verdes"],
    description:
      "Título de renda fixa emitido por bancos.",
    esgHighlight:
      "Protegido pelo FGC até R$ 250 mil por instituição.",
  },
];
