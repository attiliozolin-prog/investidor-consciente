// api/market.js
// O "Motor de Verdade" da Livo
// Conecta dados reais (Brapi) + Critérios ESG (B3)

module.exports = async (req, res) => {
  // Configuração CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { search } = req.query;
  const token = process.env.BRAPI_API_TOKEN;

  // --- 1. LISTAS BRANCAS (Whitelists) OFICIAIS DA B3 (Simulação Baseada em Dados Reais) ---
  // Fonte: B3 (Dados públicos de 2024/2025)
  const WHITELISTS = {
    // Índice de Sustentabilidade Empresarial (A "Elite" ESG)
    ISE: [
      'WEG3', 'ITUB4', 'VALE3', 'SUZB3', 'KLBN11', 'LREN3', 'RAIL3', 
      'BBDC4', 'BBAS3', 'SANB11', 'TIMS3', 'VIVT3', 'ELET3', 'CMIG4',
      'CPLE6', 'ENGIE3', 'EGIE3', 'CSAN3', 'DXCO3', 'FIBR3'
    ],
    // Novo Mercado (Governança Máxima)
    NOVO_MERCADO: [
      'WEG3', 'MGLU3', 'LREN3', 'PRIO3', 'RDOR3', 'HAPV3', 'B3SA3',
      'SUZB3', 'JBSS3', 'RENT3', 'RADL3', 'BBSE3', 'CSAN3', 'TOTS3',
      'LIGT3', 'RAIL3', 'YDUQS3', 'CVCB3', 'EZTC3', 'MRVE3'
    ],
    // Índice de Carbono Eficiente
    ICO2: [
      'WEG3', 'ITUB4', 'VALE3', 'PETR4', 'GGBR4', 'CSNA3', 'USIM5',
      'JBSS3', 'BRFS3', 'MRFG3', 'SUZB3', 'KLBN11', 'ELET3', 'CMIG4'
    ]
  };

  try {
    // --- 2. BUSCA DADOS REAIS NA BRAPI ---
    // Se tiver busca (?search=PETR4), busca específico. Se não, traz a lista das principais.
    const url = search 
      ? `https://brapi.dev/api/quote/list?search=${search}&sortBy=volume&sortOrder=desc&limit=10&token=${token}`
      : `https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=20&token=${token}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.stocks) throw new Error("Erro ao buscar dados na Brapi");

    // --- 3. ENRIQUECIMENTO DE DADOS (O "Selo Livo") ---
    const enrichedStocks = data.stocks.map(stock => {
      const ticker = stock.stock.toUpperCase();
      
      // Análise de Critérios (Pontuação Auditável)
      const badges = [];
      let esgScore = 50; // Nota base neutra
      let financialScore = 60; // Nota base

      // Critério 1: Está no ISE (Sustentabilidade)? (+25 pontos)
      if (WHITELISTS.ISE.includes(ticker)) {
        esgScore += 25;
        badges.push("ISE B3");
      }

      // Critério 2: Está no Novo Mercado (Governança)? (+15 pontos)
      if (WHITELISTS.NOVO_MERCADO.includes(ticker)) {
        esgScore += 15;
        badges.push("Novo Mercado");
      }
      
      // Critério 3: Carbono Eficiente? (+10 pontos)
      if (WHITELISTS.ICO2.includes(ticker)) {
        esgScore += 10;
        badges.push("ICO2");
      }

      // Ajuste Fino: Penalidade para setores polêmicos (Exemplo simples por nome/setor se houvesse)
      // (Numa V2, faremos isso pelo 'sector' que a API retornar)

      // Trava a nota em 100
      if (esgScore > 100) esgScore = 100;

      // Cálculo Financeiro Simplificado (Baseado na variação do dia para MVP)
      // Se subiu hoje, ganha pontos de "Momento". (Futuramente usaremos P/L)
      if (stock.change > 0) financialScore += 10;
      if (stock.change > 2) financialScore += 10;

      return {
        ticker: stock.stock,
        name: stock.name,
        price: stock.close,
        change: stock.change,
        logo: stock.logo,
        sector: stock.sector || "Ações",
        assetType: ticker.endsWith('11') ? 'fii' : 'stock', // Lógica simples para MVP
        
        // As Notas Calculadas
        esgScore,
        financialScore,
        
        // Transparência: Por que essa nota?
        esgHighlight: badges.length > 0 ? `Certificações: ${badges.join(', ')}` : "Em análise de certificações.",
        tags: badges
      };
    });

    return res.status(200).json({ stocks: enrichedStocks });

  } catch (error) {
    console.error("Erro API Market:", error);
    // Fallback se a API falhar (para o app não quebrar)
    return res.status(500).json({ error: "Falha na conexão com a B3" });
  }
};
