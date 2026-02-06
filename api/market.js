// api/market.js
// ARQUITETURA BLINDADA (HG Brasil -> Fallback Brapi -> Fallback Estático)

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=59');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { search } = req.query;
  // Tenta pegar do ENV, se falhar usa a chave direta
  const hgKey = process.env.HGBRASIL_API_KEY || '60084957'; 

  // --- 1. DEFINIR QUAIS TICKERS BUSCAR ---
  let tickersToFetch = [];
  
  try {
    if (!search) {
      // Lista Mestra (Home)
      tickersToFetch = [
        'VALE3', 'PETR4', 'ITUB4', 'BBDC4', 'BBAS3', 'WEGE3', 'MGLU3', 
        'HAPV3', 'RDOR3', 'LREN3', 'B3SA3', 'SUZB3', 'BPAC11', 'ELET3'
      ];
    } else {
      // Busca na Brapi para descobrir os códigos (Discovery)
      const searchUrl = `https://brapi.dev/api/quote/list?search=${search}&limit=8`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      
      if (searchData.stocks) {
        tickersToFetch = searchData.stocks
          .map(s => s.stock)
          .filter(t => typeof t === 'string' && (t.endsWith('3') || t.endsWith('4') || t.endsWith('11')))
          .slice(0, 10);
      }
    }

    if (tickersToFetch.length === 0) {
      return res.status(200).json({ stocks: [] });
    }

    // --- 2. TENTATIVA PRINCIPAL: HG BRASIL (DADOS OFICIAIS) ---
    try {
      const symbols = tickersToFetch.join(',');
      const hgUrl = `https://api.hgbrasil.com/finance/stock_price?key=${hgKey}&symbol=${symbols}`;
      
      const hgRes = await fetch(hgUrl);
      const hgData = await hgRes.json();
      
      // Verifica se a HG devolveu dados válidos
      if (hgData.results && !hgData.results.error) {
        const hgStocks = Object.values(hgData.results).map(item => {
          if (!item || item.error || !item.symbol) return null;
          return {
            ticker: item.symbol,
            name: item.name || item.company_name || item.symbol, // Nome bonito
            price: item.price,
            change: item.change_percent,
            logo: null, // Frontend resolve
            sector: "Ações",
            assetType: item.symbol.endsWith('11') ? 'fii' : 'stock'
          };
        }).filter(Boolean);

        if (hgStocks.length > 0) {
          console.log("Sucesso via HG Brasil");
          return res.status(200).json({ stocks: hgStocks });
        }
      }
      throw new Error("HG Brasil retornou vazio ou erro");
    } catch (hgError) {
      console.warn("Falha na HG Brasil, ativando Fallback Brapi:", hgError.message);
      // NÃO RETORNA ERRO AINDA, VAI PRO FALLBACK
    }

    // --- 3. FALLBACK DE SEGURANÇA: BRAPI (SE HG FALHAR) ---
    console.log("Tentando dados via Brapi...");
    const brapiQuoteUrl = `https://brapi.dev/api/quote/${tickersToFetch.join(',')}?range=1d&interval=1d`;
    const brapiQuoteRes = await fetch(brapiQuoteUrl);
    const brapiQuoteData = await brapiQuoteRes.json();

    if (brapiQuoteData.results) {
      const brapiStocks = brapiQuoteData.results.map(item => ({
        ticker: item.symbol,
        name: item.longName || item.symbol,
        price: item.regularMarketPrice,
        change: item.regularMarketChangePercent,
        logo: item.logourl,
        sector: "Ações",
        assetType: item.symbol.endsWith('11') ? 'fii' : 'stock'
      }));
      
      return res.status(200).json({ stocks: brapiStocks });
    }

    // --- 4. ULTIMO RECURSO: DADOS ESTÁTICOS (PARA NÃO QUEBRAR O APP) ---
    // Se tudo falhar (internet, cotas, etc), retorna isso para o usuário não ver tela branca
    const emergencyStocks = [
      { ticker: 'VALE3', name: 'Vale S.A.', price: 60.50, change: 1.2, logo: null },
      { ticker: 'PETR4', name: 'Petrobras PN', price: 35.20, change: -0.5, logo: null },
      { ticker: 'ITUB4', name: 'Itaú Unibanco', price: 33.10, change: 0.8, logo: null }
    ];
    
    return res.status(200).json({ stocks: emergencyStocks });

  } catch (criticalError) {
    console.error("Erro Crítico Geral:", criticalError);
    return res.status(500).json({ error: "Serviço indisponível temporariamente" });
  }
};
