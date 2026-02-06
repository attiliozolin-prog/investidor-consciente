// api/market.js
// VERSÃO: LISTÃO ROBUSTO (Busca Nome em múltiplos campos)

module.exports = async (req, res) => {
  // Cache curto (30s) para manter preço atualizado
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=30');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { search } = req.query;

  try {
    let url = '';

    if (search) {
      // Busca específica (ex: "Sanepar")
      url = `https://brapi.dev/api/quote/list?search=${search}&limit=20`;
    } else {
      // Home: Top 100 ações por volume (Liquidez)
      // Traz as empresas mais relevantes do mercado
      url = `https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=100`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro na Brapi: ${response.status}`);
    }

    const data = await response.json();
    const rawStocks = data.stocks || [];

    const formattedStocks = rawStocks.map(item => {
      // Ignora lixo de mercado (sem preço)
      if (!item.close && !item.price) return null;

      // --- DETETIVE DE NOMES ---
      // Tenta achar o nome em ordem de preferência:
      // 1. item.name (Geralmente o nome curto)
      // 2. item.longName (Nome completo, comum em small caps)
      // 3. item.stock (Se não tiver nada, usa o ticker para não ficar buraco)
      const finalName = item.name || item.longName || item.stock;

      return {
        ticker: item.stock,
        name: finalName,    // Agora garantimos que nunca vai vazio
        price: item.close || item.price, 
        change: item.change || item.changePercent || 0,
        logo: item.logo,
        sector: item.sector || "Ações",
        assetType: (item.stock.endsWith('11') || item.stock.endsWith('11.SA')) ? 'fii' : 'stock'
      };
    }).filter(Boolean);

    return res.status(200).json({ stocks: formattedStocks });

  } catch (error) {
    console.error("Erro ao buscar mercado:", error);
    return res.status(200).json({ stocks: [] });
  }
};
