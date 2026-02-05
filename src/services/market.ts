import { StockData } from "../types";

export interface MarketResponse {
  stocks: Partial<StockData>[];
}

export const MarketService = {
  // Busca ações reais (pesquisa ou lista geral)
  async searchStocks(query: string = ""): Promise<Partial<StockData>[]> {
    try {
      const response = await fetch(`/api/market?search=${query}`);
      if (!response.ok) throw new Error("Erro ao buscar dados");
      
      const data = await response.json();
      return data.stocks || [];
    } catch (error) {
      console.error("Market Service Error:", error);
      return [];
    }
  }
};
