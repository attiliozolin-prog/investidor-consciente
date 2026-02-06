// api/esg-scoring.js
// Motor de Scoring ESG Livo (Conectado à B3)

module.exports = async (req, res) => {
  // 1. Configuração de Cache (Stale-While-Revalidate)
  // s-maxage=86400 (24h de cache no CDN da Vercel)
  // stale-while-revalidate=43200 (12h aceitando cache antigo enquanto renova)
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=43200');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // 2. Definição dos Índices e Pesos
    const INDICES = [
      { code: 'ISE', weight: 35 },      // Sustentabilidade (Peso Máximo)
      { code: 'ICO2', weight: 15 },     // Carbono
      { code: 'IDIVERSA', weight: 15 }, // Diversidade
      { code: 'IGCT', weight: 15 },     // Governança Trade
      { code: 'IGPTW', weight: 10 }     // Melhores Empresas
    ];

    // Função auxiliar para buscar na B3 (API Pública)
    const fetchB3Portfolio = async (indexCode) => {
      const url = `https://sistemaswebb3-listados.b3.com.br/indexProxy/indexCall/GetPortfolioDay/${indexCode}`;
      try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        // A API da B3 retorna { results: [ { cod: "WEGE3", ... } ] }
        return (data.results || []).map(item => ({
          ticker: item.cod.trim(),
          name: item.asset.trim()
        }));
      } catch (err) {
        console.error(`Erro ao buscar índice ${indexCode}:`, err);
        return [];
      }
    };

    // 3. Execução Paralela (Performance)
    // Buscamos o IBRA (Universo Geral) + Todos os índices ESG ao mesmo tempo
    const [ibraList, ...esgPortfolios] = await Promise.all([
      fetchB3Portfolio('IBRA'), // Lista Mestre
      ...INDICES.map(idx => fetchB3Portfolio(idx.code))
    ]);

    if (!ibraList.length) {
      throw new Error("Falha crítica: Não foi possível buscar a lista mestre (IBRA)");
    }

    // 4. Algoritmo de Pontuação (Scoring Engine)
    const scores = ibraList.map(company => {
      let score = 5; // Piso inicial
      let badges = [];

      // Verifica presença em cada índice ESG
      INDICES.forEach((index, i) => {
        const isInIndex = esgPortfolios[i].some(stock => stock.ticker === company.ticker);
        
        if (isInIndex) {
          score += index.weight;
          badges.push(index.code);
        }
      });

      // Regra de Limite
      if (score > 100) score = 100;

      return {
        ticker: company.ticker,
        name: company.name,
        score: score,
        badges: badges
      };
    });

    // Ordena por Score (Maior para menor)
    scores.sort((a, b) => b.score - a.score);

    // 5. Output
    return res.status(200).json({ 
      updatedAt: new Date().toISOString(),
      totalAssets: scores.length,
      data: scores 
    });

  } catch (error) {
    console.error("Erro Crítico no Scoring Engine:", error);
    // Em caso de erro total, tenta retornar um status 500 mas sem cache para não travar
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(500).json({ error: "Falha ao calcular scores ESG", details: error.message });
  }
};
