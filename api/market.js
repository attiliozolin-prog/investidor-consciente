// src/api/market.js

export const MarketService = {
  // Função principal de busca
  async searchStocks(query) {
    try {
      // 1. Tenta buscar do nosso "Backend Livo" na Vercel
      // O caminho relativo /api/... funciona automaticamente depois do deploy
      const response = await fetch('/api/esg-ranking');
      
      if (!response.ok) {
        throw new Error('Falha ao conectar com Livo Server');
      }

      const allStocks = await response.json();

      // 2. Filtragem Local (O usuário digitou "PETR"?)
      if (!query) return allStocks.slice(0, 20); // Retorna os top 20 se não tiver busca

      const upperQuery = query.toUpperCase();
      
      return allStocks.filter(stock => 
        stock.ticker.includes(upperQuery) || 
        (stock.name && stock.name.toUpperCase().includes(upperQuery))
      );

    } catch (error) {
      console.error("Erro no MarketService:", error);
      // Fallback: Se der erro (ex: rodando local sem servidor), retorna array vazio ou dados mockados
      return []; 
    }
  }
};
