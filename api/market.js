// api/market.js
// VERSÃO BUNKER: Brapi (Principal) + Backup Local (Garantia de Dados)

// Dados de emergência para garantir que a Home nunca fique vazia
const FALLBACK_STOCKS = [
  { ticker: 'VALE3', name: 'Vale S.A.', price: 60.50, change: 1.2, logo: null, sector: 'Mineração', assetType: 'stock' },
  { ticker: 'PETR4', name: 'Petrobras PN', price: 36.20, change: -0.5, logo: null, sector: 'Petróleo', assetType: 'stock' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco', price: 33.10, change: 0.8, logo: null, sector: 'Financeiro', assetType: 'stock' },
  { ticker: 'BBDC4', name: 'Bradesco PN', price: 13.50, change: -1.2, logo: null, sector: 'Financeiro', assetType: 'stock' },
  { ticker: 'BBAS3', name: 'Banco do Brasil', price: 27.80, change: 0.5, logo: null, sector: 'Financeiro', assetType: 'stock' },
  { ticker: 'WEGE3', name: 'WEG S.A.', price: 55.40, change: 2.1, logo: null, sector: 'Industrial', assetType: 'stock' },
  { ticker: 'MGLU3', name: 'Magazine Luiza', price: 2.10, change: -3.0, logo: null, sector: 'Varejo', assetType: 'stock' },
  { ticker: 'HAPV3', name: 'Hapvida', price: 3.90, change: 0.0, logo: null, sector: 'Saúde', assetType: 'stock' },
  { ticker: 'RDOR3', name: 'Rede DOr', price: 28.50, change: 1.5, logo: null, sector: 'Saúde', assetType: 'stock' },
  { ticker: 'LREN3', name: 'Lojas Renner', price: 16.20, change: -0.8, logo: null, sector: 'Varejo', assetType: 'stock' },
  { ticker: 'B3SA3', name: 'B3 S.A.', price: 11.80, change: 1.1, logo: null, sector: 'Financeiro', assetType: 'stock' },
  { ticker: 'SUZB3', name: 'Suzano', price: 58.90, change: -0.2, logo: null, sector: 'Papel e Celulose', assetType: 'stock' },
  { ticker: 'BPAC11', name: 'BTG Pactual', price: 35.60, change: 1.8, logo: null, sector: 'Financeiro', assetType: 'fii' },
  { ticker: 'ELET3', name: 'Eletrobras ON', price: 42.10, change: 0.4, logo: null, sector: 'Elétrico', assetType: 'stock' },
  { ticker: 'PRIO3', name: 'Prio', price: 46.70, change: 3.2, logo: null, sector: 'Petróleo', assetType: 'stock' }
];

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=60');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { search } = req.query;

  try {
    // 1. MODO DE BUSCA (Quando o usuário digita)
    if (search) {
      const searchUrl = `https://brapi.dev/api/quote/list?search=${search}&limit=10`;
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      const stocks = (data.stocks || []).map(item => ({
        ticker: item.stock,
        name: item.name,
        price: item.close,
        change: item.change,
        logo: item.logo,
        sector: item.sector,
        assetType: item.stock.endsWith('11') ? 'fii' : 'stock'
      }));

      return res.status(200).json({ stocks });
    }

    // 2. MODO HOME (Lista Padrão)
    // Tenta pegar dados frescos da Brapi
    const defaultTickers = 'VALE3,PETR4,ITUB4,BBDC4,BBAS3,WEGE3,MGLU3,HAPV3,RDOR3,LREN3,B3SA3,SUZB3';
    const homeUrl = `https://brapi.dev/api/quote/${defaultTickers}?range=1d&interval=1d`;
    
    const response = await fetch(homeUrl);
    
    if (!response.ok) {
      throw new Error("Brapi offline ou bloqueada");
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error("Brapi retornou lista vazia");
    }

    const formattedStocks = data.results.map(item => ({
      ticker: item.symbol,
      name: item.longName || item.symbol,
      price: item.regularMarketPrice,
      change: item.regularMarketChangePercent,
      logo: item.logourl,
      sector: "Ações",
      assetType: item.symbol.endsWith('11') ? 'fii' : 'stock'
    }));

    return res.status(200).json({ stocks: formattedStocks });

  } catch (error) {
    console.warn("Falha na API Externa, usando Backup Local:", error.message);
    
    // --- O SALVA-VIDAS ---
    // Se a busca falhou (API caiu, limite excedido, erro de rede),
    // retornamos a lista hardcoded para o usuário não ficar sem nada.
    // (Apenas se não for uma busca específica de texto)
    if (!search) {
      return res.status(200).json({ 
        stocks: FALLBACK_STOCKS,
        source: "backup" 
      });
    }

    // Se foi uma busca de texto que falhou, retornamos vazio mesmo
    return res.status(200).json({ stocks: [] });
  }
};
