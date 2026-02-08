import { STOCKS_DB } from "../data/stocks";

export interface EsgEvidence {
  type: 'BASE' | 'BONUS' | 'PENALTY' | 'KILL';
  desc: string;
  val: number;
  source?: string;
}

export interface EsgScoreData {
  score: number;
  badges: string[];
  evidence_log?: EsgEvidence[];
}

export const MarketService = {
  // Busca os dados da nossa API /api/esg-scoring
  async getEsgScores(): Promise<Record<string, EsgScoreData>> {
    try {
      const response = await fetch('/api/esg-scoring');
      if (!response.ok) throw new Error('Falha no ESG Score');
      const json = await response.json();
      
      const map: Record<string, EsgScoreData> = {};
      
      if (json.data && Array.isArray(json.data)) {
        json.data.forEach((item: any) => {
          map[item.ticker] = {
            score: item.score,
            badges: item.badges,
            evidence_log: item.evidence_log
          };
        });
      }
      return map;
    } catch (error) {
      console.error("Erro carregando ESG:", error);
      return {};
    }
  },

  // Busca ações na Brapi (Gratuita) com TRADUÇÃO DE CAMPOS
  async searchStocks(term: string): Promise<any[]> {
    if (!term || term.length < 2) return [];
    try {
        const response = await fetch(`https://brapi.dev/api/quote/list?search=${term}&limit=10`);
        const data = await response.json();
        
        if (!data.stocks || !Array.isArray(data.stocks)) return [];

        // --- CORREÇÃO DO CRASH AQUI ---
        // A Brapi retorna { stock: "WEGE3" }, nós queremos { ticker: "WEGE3" }
        return data.stocks.map((item: any) => ({
            ...item,
            ticker: item.stock || item.ticker || "UNKNOWN", // Garante que 'ticker' sempre exista
            logo: item.logo,
            name: item.name,
            sector: item.sector,
            change: item.change || 0,
            price: item.close || 0
        }));

    } catch (error) {
        console.error("Erro na busca Brapi:", error);
        return [];
    }
  }
};
