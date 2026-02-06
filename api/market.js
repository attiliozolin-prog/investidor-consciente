// api/market.js
// ARQUITETURA PROFISSIONAL: Brapi (Busca) + HG Brasil (Dados Reais)

module.exports = async (req, res) => {
  // Cache de 60 segundos para não estourar a cota da HG em buscas repetidas
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { search } = req.query;
  const hgKey = process.env.HGBRASIL_API_KEY; // Sua chave segura

  try {
    // 1. BUSCA (DISCOVERY) - Usamos a Brapi para encontrar os tickers
    // Se não tiver busca, trazemos os Top do IBOV para a Home
    let tickersToFetch = [];

    if (!search) {
      // Lista curada de Blue Chips para a tela inicial (Dados de alta qualidade)
      tickersToFetch = [
        'VALE3', 'PETR4', 'ITUB4', 'BBDC4', 'BBAS3', 'WEGE3', 'MGLU3', 
        'HAPV3', 'RDOR3', 'LREN3', 'B3SA3', 'SUZB3', 'BPAC11', 'ELET3', 
        'PRIO3', 'RAIL3', 'GGBR4', 'JBSS3', 'VIVT3', 'TIMS3'
      ];
    } else {
      // Se usuário digitou algo, buscamos na Brapi para descobrir os códigos
      const brapiUrl = `https://brapi.dev/api/quote/list?search=${search}&limit=8`;
      const brapiRes = await fetch(brapiUrl);
      const brapiData = await brapiRes.json();
      
      if (brapiData.stocks) {
        // FILTRO DE QUALIDADE: Prioriza Ações (3, 4) e Units/FIIs (11)
        // Ignora BDRs estranhos (finais 32, 33, 34, 35) se possível, para limpar a lista
        tickersToFetch = brapiData.stocks
          .map(s => s.stock)
          .filter(t => t.endsWith('3') || t.endsWith('4') || t.endsWith('11') || t.endsWith('6'))
          .slice(0, 10); // Limita a 10 para economizar requisições HG
      }
    }

    if (tickersToFetch.length === 0) {
      return res.status(200).json({ stocks: [] });
    }

    // 2. DADOS OFICIAIS (TRUTH) - Consultamos a HG Brasil
    // A HG aceita múltiplos símbolos separados por vírgula (Economiza requisições)
    const symbols = tickersToFetch.join(',');
    const hgUrl = `https://api.hgbrasil.com/finance/stock_price?key=${hgKey}&symbol=${symbols}`;
    
    const hgRes = await fetch(hgUrl);
    const hgData = await hgRes.json();
    const results = hgData.results || {};

    // 3. MERGE E FORMATAÇÃO
    // Transformamos o formato da HG no formato que o nosso Frontend espera
    const formattedStocks = Object.values(results).map(item => {
      // Se houver erro no item (ex: ativo não encontrado), ignoramos
      if (item.error) return null;

      return {
        ticker: item.symbol,
        // A HG entrega o 'name' (Nome Comercial) ou 'company_name' (Razão Social).
        // 'name' costuma ser mais amigável ("Petrobras" vs "Petroleo Brasileiro S.A. Petrobras")
        name: item.name || item.company_name, 
        price: item.price,
        change: item.change_percent,
        logo: null, // Deixamos nulo para o Frontend usar o componente StockLogo inteligente
        sector: "Ações", // HG Free não manda setor, mas não tem problema
        assetType: item.symbol.endsWith('11') ? 'fii' : 'stock'
      };
    }).filter(Boolean); // Remove nulos

    return res.status(200).json({ stocks: formattedStocks });

  } catch (error) {
    console.error("Erro API Market:", error);
    // Fallback silencioso
    return res.status(200).json({ stocks: [] });
  }
};
