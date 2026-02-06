// api/market.js
// VERSÃO: LISTÃO DE MERCADO (Top Liquidez + Preços Dinâmicos)

module.exports = async (req, res) => {
  // Cache curto (30 segundos) para garantir que o preço se atualize se der F5
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=30');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { search } = req.query;

  try {
    // URL BASE DA BRAPI
    let url = '';

    if (search) {
      // MODO BUSCA: Procura qualquer ativo que combine com o texto
      // limit=20 para a busca ficar rápida
      url = `https://brapi.dev/api/quote/list?search=${search}&limit=20`;
    } else {
      // MODO HOME (MERCADO GERAL):
      // sortBy=volume -> Traz as ações mais negociadas primeiro (as mais famosas/relevantes)
      // limit=100 -> Traz as TOP 100 ações da bolsa. (Cobre quase tudo que importa)
      url = `https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=100`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro na Brapi: ${response.status}`);
    }

    const data = await response.json();
    const rawStocks = data.stocks || [];

    // FORMATAÇÃO DE DADOS
    // O endpoint /list retorna campos ligeiramente diferentes do /quote
    const formattedStocks = rawStocks.map(item => {
      // Filtro básico de qualidade: Ignora ações sem preço ou sem nome
      if (!item.close && !item.price) return null;

      return {
        ticker: item.stock, // Na listagem, o código vem em 'stock'
        name: item.name,    // Nome oficial da empresa
        price: item.close,  // Preço atual (com delay de 15min se for free)
        change: item.change,// Variação percentual do dia
        logo: item.logo,    // Logo da Brapi (o Frontend vai decidir se usa ou o GitHub)
        sector: item.sector || "Ações",
        assetType: (item.stock.endsWith('11') || item.stock.endsWith('11.SA')) ? 'fii' : 'stock'
      };
    }).filter(Boolean); // Remove os nulos

    // Retorna a lista real. Se estiver vazia, retorna vazio (sem dados falsos).
    return res.status(200).json({ stocks: formattedStocks });

  } catch (error) {
    console.error("Erro ao buscar mercado:", error);
    // Em caso de erro real (API fora do ar), retornamos lista vazia.
    // Melhor mostrar nada do que mostrar preço errado.
    return res.status(200).json({ stocks: [] });
  }
};
