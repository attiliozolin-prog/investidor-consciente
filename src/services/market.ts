// src/services/market.ts

export interface EsgEvidence {
  type: 'BASE' | 'BONUS' | 'PENALTY' | 'KILL';
  desc: string;
  val: number;
  source?: string;
}

export interface EsgScoreData {
  score: number;
  badges: string[];
  evidence_log?: EsgEvidence[]; // <--- ADICIONADO: O campo que estava faltando
}

export const MarketService = {
  // Busca os dados da nossa API /api/esg-scoring
  async getEsgScores(): Promise<Record<string, EsgScoreData>> {
    try {
      const response = await fetch('/api/esg-scoring');
      if (!response.ok) throw new Error('Falha no ESG Score');
      const json = await response.json();
      
      // Transforma o Array da API em um Mapa (Objeto) para acesso rápido no App.tsx
      const map: Record<string, EsgScoreData> = {};
      
      if (json.data && Array.isArray(json.data)) {
        json.data.forEach((item: any) => {
          map[item.ticker] = {
            score: item.score,
            badges: item.badges,
            evidence_log: item.evidence_log // Agora o TS aceita isso
          };
        });
      }
      return map;
    } catch (error) {
      console.error("Erro carregando ESG:", error);
      return {};
    }
  },

  // Busca ações na Brapi (Gratuita)
  async searchStocks(term: string): Promise<any[]> {
    if (!term || term.length < 2) return [];
    try {
        // Usamos a rota de lista da Brapi que é gratuita e permite busca
        const response = await fetch(`https://brapi.dev/api/quote/list?search=${term}&limit=10`);
        const data = await response.json();
        return data.stocks || [];
    } catch (error) {
        console.error("Erro na busca Brapi:", error);
        return [];
    }
  }
};
