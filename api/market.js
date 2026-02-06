// api/market.js
// VERSÃO RESTAURADA: Brapi Pura (Foco em Volume de Dados)

module.exports = async (req, res) => {
  // Cache rápido (30s) para garantir agilidade
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=30');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { search } = req.query;

  try {
    // 1. DEFINIR A URL (Busca ou Lista Padrão)
    let url = '';
    
    if (search) {
      // Busca específica (ex: "Sanepar", "MGLU")
      url = `https://brapi.dev/api/quote/list?search=${search}&limit=15`; // Traz até 15 resultados
    } else {
      // Lista Padrão (Home): Traz as ações mais negociadas do IBOV
      // Usamos uma lista fixa de IDs para garantir que sempre venha as "famosas"
      const defaultTickers = 'VALE3,PETR4,ITUB4,BBDC4,BBAS3,WEGE3,MGLU3,HAPV3,RDOR3,LREN3,B3SA3,SUZB3,BPAC11,ELET3,PRIO3,RAIL3,GGBR4,JBSS3,VIVT3,TIMS3,CMIG4,CPLE6,CSAN3,ITSA4';
      url = `https://brapi.dev/api/quote/${defaultTickers}?range=1d&interval=1d`;
    }

    const response = await fetch(url);
    const data = await response.json();
    let rawStocks = [];

    // A Brapi tem formatos diferentes de resposta dependendo do endpoint
    if (search) {
      // Formato de Busca
      rawStocks = data.stocks || [];
    } else {
      // Formato de Cotação Múltipla
      rawStocks = data.results || [];
    }

    // 2. FORMATAÇÃO E LIMPEZA
    const formattedStocks = rawStocks.map(item => {
      // Normaliza os campos que mudam de nome entre endpoints
      const ticker = item.stock || item.symbol;
      const name = item.name || item.longName || ticker; // Tenta pegar o nome longo
      const price = item.close || item.regularMarketPrice || 0;
      const change = item.change || item.regularMarketChangePercent || 0;
      const logo = item.logo || item.logourl; 

      return {
        ticker: ticker,
        name: name,
        price: price,
        change: change,
        logo: logo, // Envia o logo, mas o Frontend vai decidir se usa ou não
        sector: item.sector || "Ações",
        assetType: (ticker.endsWith('11') || ticker.endsWith('11.SA')) ? 'fii' : 'stock'
      };
    }).filter(s => s.price > 0); // Remove ações com preço zero/erro

    return res.status(200).json({ stocks: formattedStocks });

  } catch (error) {
    console.error("Erro API Brapi:", error);
    // Em caso de erro total, retorna lista vazia mas não quebra o app
    return res.status(200).json({ stocks: [] });
  }
};
