import { StockData } from "../types";

export interface EsgScoreData {
  ticker: string;
  name: string;
  score: number;
  badges: string[];
}

export const MarketService = {
  // 1. Busca Dados de Mercado (Preço/Logo - Via Brapi/Market API antiga)
  async searchStocks(query: string = ""): Promise<Partial<StockData>[]> {
    try {
      const response = await fetch(`/api/market?search=${query}`);
      if (!response.ok) throw new Error("Erro ao buscar dados de mercado");
      const data = await response.json();
      return data.stocks || [];
    } catch (error) {
      console.error("Market Service Error:", error);
      return [];
    }
  },

  // 2. Busca Scores ESG (Via B3/Scoring Engine Nova)
  async getEsgScores(): Promise<Record<string, EsgScoreData>> {
    try {
      const response = await fetch('/api/esg-scoring');
      if (!response.ok) throw new Error("Erro ao buscar scores ESG");
      const json = await response.json();
      
      // Transforma o Array em um Map (Objeto) para acesso rápido por Ticker O(1)
      const scoreMap: Record<string, EsgScoreData> = {};
      json.data.forEach((item: EsgScoreData) => {
        scoreMap[item.ticker] = item;
      });
      
      return scoreMap;
    } catch (error) {
      console.error("ESG Score Service Error:", error);
      return {};
    }
  }
};
