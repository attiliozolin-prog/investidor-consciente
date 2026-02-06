// api/market.js
// ARQUITETURA PROFISSIONAL: Brapi (Busca) + HG Brasil (Dados Reais)
// Versão Blindada v2 (Tratamento de Erros Nulos)

module.exports = async (req, res) => {
  // Cache de 60 segundos
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { search } = req.query;
  // Fallback seguro se a variável de ambiente falhar (mas tente usar a do .env)
  const hgKey = process.env.HGBRASIL_API_KEY || '60084957'; 

  try {
    // 1. BUSCA (DISCOVERY) - Usamos a Brapi para encontrar os tickers
    let tickersToFetch = [];

    if (!search) {
      // Lista curada de Blue Chips
      tickersToFetch = [
        'VALE3', 'PETR4', 'ITUB4', 'BBDC4', 'BBAS3', 'WEGE3', 'MGLU3', 
        'HAPV3', 'RDOR3', 'LREN3', 'B3SA3', 'SUZB3', 'BPAC11', 'ELET3', 
        'PRIO3', 'RAIL3', 'GGBR4', 'JBSS3', 'VIVT3', 'TIMS3'
      ];
    } else {
      // Busca na Brapi para descobrir códigos
      const brapiUrl = `https://brapi.dev/api/quote/list?search=${search}&limit=8`;
      const brapiRes = await fetch(brapiUrl);
      const brapiData = await brapiRes.json();
      
      if (brapiData.stocks) {
        // Filtra para evitar BDRs estranhos ou fracionários
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
    
    const hgRes = await fetch(hgUrl);
    const hgData = await hgRes.json();
    const results = hgData.results || {};

    // 3. MERGE E BLINDAGEM (Correção do Erro)
    const formattedStocks = Object.values(results).map(item => {
      // --- DEFESA CONTRA ERROS ---
      // 1. Se item for null ou undefined
      if (!item) return null;
      // 2. Se a API retornou erro explícito para este ativo
      if (item.error) return null;
      // 3. (A Correção Principal) Se não tiver symbol, não tem como continuar
      if (!item.symbol || typeof item.symbol !== 'string') return null;

      // Se passou pelas defesas, processa:
      return {
        ticker: item.symbol,
        name: item.name || item.company_name || item.symbol, // Fallback triplo para o nome
        price: item.price,
        change: item.change_percent,
        logo: null, 
        sector: "Ações",
        assetType: item.symbol.endsWith('11') ? 'fii' : 'stock'
      };
    }).filter(Boolean); // Remove os nulos gerados pela defesa

    return res.status(200).json({ stocks: formattedStocks });

  } catch (error) {
    console.error("Erro API Market:", error);
    // Retorna array vazio em vez de crashar, para o frontend mostrar "Nenhum ativo" elegantemente
    return res.status(200).json({ stocks: [] }); 
  }
};
