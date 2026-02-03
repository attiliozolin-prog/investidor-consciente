// ===================================
// MOCK DE NOTÍCIAS & INSIGHTS
// Futuramente substituído por API / IA
// ===================================

export interface MarketNews {
  title: string;
  source: string;
  url: string;
}

export const MARKET_NEWS: MarketNews[] = [
  {
    title:
      "Energia renovável cresce no Brasil e atrai investidores de longo prazo",
    source: "InfoMoney",
    url: "#",
  },
  {
    title:
      "Bancos ampliam crédito verde e reforçam compromissos ESG",
    source: "Valor Econômico",
    url: "#",
  },
  {
    title:
      "Fundos Imobiliários seguem atrativos mesmo com juros elevados",
    source: "Suno Research",
    url: "#",
  },
  {
    title:
      "Tesouro Selic continua sendo a principal porta de entrada para iniciantes",
    source: "Tesouro Direto",
    url: "#",
  },
];
