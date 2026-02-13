// api/market.js
// VERSÃO: LISTÃO ROBUSTO (Com Autenticação Brapi)

module.exports = async (req, res) => {
  // CORS Restrito (apenas domínios permitidos)
  const allowedOrigins = [
    'https://livo-beta.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // Cache curto (30s) para manter preço atualizado
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=30');

  const { search } = req.query;

  // PEGA O TOKEN DAS VARIÁVEIS DE AMBIENTE (VERCEL)
  const token = process.env.BRAPI_API_KEY;

  try {
    let url = '';

    // Monta a Query String com o token (se existir)
    const tokenParam = token ? `&token=${token}` : '';

    if (search) {
      // Busca específica (ex: "Sanepar")
      url = `https://brapi.dev/api/quote/list?search=${search}&limit=30${tokenParam}`;
    } else {
      // Home: Top 50 ações mais transacionadas por volume
      url = `https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=50${tokenParam}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      // Se der erro de token (401), avisa no log
      if (response.status === 401) {
        console.error("Erro Brapi 401: Token inválido ou ausente. Configure BRAPI_API_KEY na Vercel.");
      }
      throw new Error(`Erro na Brapi: ${response.status}`);
    }

    const data = await response.json();
    const rawStocks = data.stocks || [];

    const formattedStocks = rawStocks.map(item => {
      // Ignora lixo de mercado (sem preço)
      if (!item.close && !item.price) return null;

      // --- DETETIVE DE NOMES ---
      const finalName = item.name || item.longName || item.stock;

      return {
        ticker: item.stock,
        name: finalName,
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
