// api/market.js
// ARQUITETURA PROFISSIONAL: Brapi (Busca) + HG Brasil (Dados Reais)
// Versão Blindada v3 (Com chave hardcoded de backup e proteção total contra erros)

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { search } = req.query;
  
  // Tenta pegar do ENV, se falhar usa a chave direta que você me passou
  const hgKey = process.env.HGBRASIL_API_KEY || '60084957'; 

  try {
    // 1. BUSCA (DISCOVERY) - Brapi
    let tickersToFetch = [];

    if (!search) {
      tickersToFetch = [
        'VALE3', 'PETR4', 'ITUB4', 'BBDC4', 'BBAS3', 'WEGE3', 'MGLU3', 
        'HAPV3', 'RDOR3', 'LREN3', 'B3SA3', 'SUZB3', 'BPAC11', 'ELET3', 
        'PRIO3', 'RAIL3', 'GGBR4', 'JBSS3', 'VIVT3', 'TIMS3'
      ];
    } else {
      const brapiUrl = `https://brapi.dev/api/quote/list?search=${search}&limit=8`;
      const brapiRes = await fetch(brapiUrl);
      const brapiData = await brapiRes.json();
      
      if (brapiData.stocks) {
        tickersToFetch = brapiData.stocks
          .map(s => s.stock)
          .filter(t => typeof t === 'string' && (t.endsWith('3') || t.endsWith('4') || t.endsWith('11') || t.endsWith('6')))
          .slice(0, 10);
      }
    }

    if (tickersToFetch.length === 0) {
      return res.status(200).json({ stocks: [] });
    }

    // 2. DADOS OFICIAIS (TRUTH) - HG Brasil
    const symbols = tickersToFetch.join(',');
    const hgUrl = `https://api.hgbrasil.com/finance/stock_price?key=${hgKey}&symbol=${symbols}`;
    
    console.log(`Fetching HG Brasil: ${hgUrl.replace(hgKey, '***')}`); // Log para debug (ocultando chave)

    const hgRes = await fetch(hgUrl);
    const hgData = await hgRes.json();
    const results = hgData.results || {};

    // 3. MERGE E BLINDAGEM (Aqui estava o erro antigo)
    const formattedStocks = Object.values(results).map(item => {
      // --- PROTEÇÃO CONTRA CRASH (CRUCIAL) ---
      // Se o item for erro, nulo ou não tiver symbol, pulamos.
      if (!item || item.error || !item.symbol || typeof item.symbol !== 'string') {
        return null;
      }

      return {
        ticker: item.symbol,
        name: item.name || item.company_name || item.symbol, // Prioriza nome bonito
        price: item.price,
        change: item.change_percent,
        logo: null, // Deixa o frontend resolver o logo
        sector: "Ações",
        assetType: item.symbol.endsWith('11') ? 'fii' : 'stock'
      };
    }).filter(Boolean); // Remove os nulos

    return res.status(200).json({ stocks: formattedStocks });

  } catch (error) {
    console.error("Erro Fatal API Market:", error);
    // Retorna array vazio em vez de erro 500 para não quebrar a tela
    return res.status(200).json({ stocks: [] }); 
  }
};
