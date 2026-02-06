// api/esg-ranking.js
// Esse código roda nos servidores da Vercel, não no celular do usuário.

export default async function handler(request, response) {
  // 1. Configuração dos Pesos (Sua Regra de Ouro)
  const WEIGHTS = {
    ISE: 35,      // Índice de Sustentabilidade (O mais difícil)
    ICO2: 15,     // Carbono Eficiente
    IDIVERSA: 15, // Diversidade
    IGCT: 15,     // Governança Corporativa
    GPTW: 10,     // Melhores lugares para trabalhar
    IGPTW: 10,    // Variação do nome acima
  };

  // Lista de índices que vamos varrer na B3
  const indices = ['ISE', 'ICO2', 'IDIVERSA', 'IGCT', 'IGPTW'];

  try {
    const scores = {};

    // 2. O Loop de Coleta (O Crawler)
    // Vamos buscar todas as listas em paralelo para ser rápido
    const promises = indices.map(async (index) => {
      try {
        const res = await fetch(`https://sistemaswebb3-listados.b3.com.br/indexProxy/indexCall/GetPortfolioDay/${index}`);
        const data = await res.json();
        
        // A B3 retorna uma lista em 'results'. Vamos processar.
        if (data.results) {
          data.results.forEach((company) => {
            const ticker = company.cod; // Ex: VALE3
            
            if (!scores[ticker]) {
              scores[ticker] = {
                ticker: ticker,
                name: company.asset, // Nome da empresa
                score: 5, // Nota mínima de incentivo por estar listada
                badges: [] // Medalhas que vai ganhar
              };
            }

            // Evita duplicar pontuação do mesmo índice
            const indexKey = index === 'IGPTW' ? 'GPTW' : index; // Normaliza nomes
            if (!scores[ticker].badges.includes(indexKey)) {
              scores[ticker].score += (WEIGHTS[index] || 10);
              scores[ticker].badges.push(indexKey);
            }
          });
        }
      } catch (err) {
        console.error(`Erro ao buscar índice ${index}`, err);
      }
    });

    await Promise.all(promises);

    // 3. Transformar em Lista e Ordenar
    const ranking = Object.values(scores).map(company => {
      // Teto de 100 pontos
      if (company.score > 100) company.score = 100;
      
      return {
        ...company,
        // Adiciona dados visuais simples
        coherenceScore: company.score, // Compatibilidade com seu App
        sector: "Bolsa Brasileira" // Placeholder
      };
    });

    // Cache de 24 horas (CDN) para ser MUITO rápido e não travar a B3
    response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    
    return response.status(200).json(ranking);

  } catch (error) {
    return response.status(500).json({ error: 'Erro ao gerar ranking ESG', details: error.message });
  }
}
