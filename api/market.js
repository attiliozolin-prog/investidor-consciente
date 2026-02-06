// api/market.js
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { search } = req.query;
  const token = process.env.BRAPI_API_TOKEN;

  // --- 1. WHITELISTS B3 EXPANDIDAS (Dados Reais 2025) ---
  const WHITELISTS = {
    ISE: [ // Índice de Sustentabilidade Empresarial
      'WEG3', 'ITUB4', 'VALE3', 'SUZB3', 'KLBN11', 'LREN3', 'RAIL3', 
      'BBDC4', 'BBAS3', 'SANB11', 'TIMS3', 'VIVT3', 'ELET3', 'CMIG4',
      'CPLE6', 'ENGIE3', 'EGIE3', 'CSAN3', 'DXCO3', 'FIBR3', 'MGLU3',
      'RADL3', 'NATU3', 'BRFS3', 'CIEL3', 'HYPE3'
    ],
    NOVO_MERCADO: [ // Governança Máxima
      'WEG3', 'MGLU3', 'LREN3', 'PRIO3', 'RDOR3', 'HAPV3', 'B3SA3',
      'SUZB3', 'JBSS3', 'RENT3', 'RADL3', 'BBSE3', 'CSAN3', 'TOTS3',
      'LIGT3', 'RAIL3', 'YDUQS3', 'CVCB3', 'EZTC3', 'MRVE3', 'CRFB3',
      'NTCO3', 'SOMA3', 'PETZ3', 'LWSA3'
    ],
    ICO2: [ // Carbono Eficiente
      'WEG3', 'ITUB4', 'VALE3', 'PETR4', 'GGBR4', 'CSNA3', 'USIM5',
      'JBSS3', 'BRFS3', 'MRFG3', 'SUZB3', 'KLBN11', 'ELET3', 'CMIG4',
      'GOAU4', 'PCAR3', 'UGPA3', 'VIVT3'
    ],
    IGPTW: [ // Melhores Empresas para Trabalhar (GPTW B3)
      'ITUB4', 'BBDC4', 'CIEL3', 'BBSE3', 'CXSE3', 'VIVT3', 'TIMS3'
    ]
  };

  try {
    // AUMENTADO O LIMIT PARA 60 PARA TRAZER MAIS OPÇÕES
    const url = search 
      ? `https://brapi.dev/api/quote/list?search=${search}&sortBy=volume&sortOrder=desc&limit=15&token=${token}`
      : `https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=60&token=${token}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.stocks) throw new Error("Erro ao buscar dados na Brapi");

    const enrichedStocks = data.stocks.map(stock => {
      const ticker = stock.stock.toUpperCase();
      
      // Análise de Critérios (Pontuação Auditável)
      const badges = [];
      let esgScore = 50; 
      let financialScore = 60; 

      // Lógica de Pontuação e Badges
      if (WHITELISTS.ISE.includes(ticker)) { esgScore += 20; badges.push("ISE B3"); }
      if (WHITELISTS.NOVO_MERCADO.includes(ticker)) { esgScore += 15; badges.push("Novo Mercado"); }
      if (WHITELISTS.ICO2.includes(ticker)) { esgScore += 10; badges.push("ICO2"); }
      if (WHITELISTS.IGPTW.includes(ticker)) { esgScore += 10; badges.push("IGPTW B3"); }

      // Se não tiver nenhum selo, tenta compensar se for setor de energia limpa (lógica simples)
      if (stock.sector === "Utilidade Pública" && badges.length === 0) {
         esgScore += 5;
      }

      if (esgScore > 100) esgScore = 100;

      // Cálculo Financeiro Simplificado
      if (stock.change > 0) financialScore += 10;
      
      return {
        ticker: stock.stock,
        name: stock.name,
        price: stock.close,
        change: stock.change,
        // Garante que o logo venha limpo
        logo: stock.logo || null, 
        sector: stock.sector || "Ações",
        assetType: ticker.endsWith('11') ? 'fii' : 'stock',
        
        esgScore,
        financialScore,
        
        // Tags agora contém APENAS os índices oficiais
        tags: badges 
      };
    });

    return res.status(200).json({ stocks: enrichedStocks });

  } catch (error) {
    console.error("Erro API Market:", error);
    return res.status(500).json({ error: "Falha na conexão com a B3" });
  }
};
