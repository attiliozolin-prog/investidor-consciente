// api/summarize.js
// V3: Com Módulo de Notícias em Tempo Real (Google News RSS)

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ticker, name } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Chave OpenAI não configurada." });
  }

  try {
    // --- PASSO 1: BUSCAR NOTÍCIAS RECENTES (GOOGLE NEWS RSS) ---
    // Buscamos por "Nome da Empresa" + "Ações" ou "Mercado" para filtrar fofoca e pegar business
    const query = encodeURIComponent(`${name} ações mercado financeiro`);
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
    
    let newsContext = "Não foram encontradas notícias recentes.";
    
    try {
      const rssResponse = await fetch(rssUrl);
      const rssText = await rssResponse.text();
      
      // Parser simples de XML via Regex (para não precisar instalar bibliotecas extras)
      const items = rssText.match(/<item>[\s\S]*?<\/item>/g) || [];
      
      // Pega as 3 notícias mais recentes
      const recentNews = items.slice(0, 3).map(item => {
        const titleMatch = item.match(/<title>(.*?)<\/title>/);
        const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
        return {
          title: titleMatch ? titleMatch[1] : "Sem título",
          date: dateMatch ? new Date(dateMatch[1]).toLocaleDateString('pt-BR') : "Data desc."
        };
      });

      if (recentNews.length > 0) {
        newsContext = recentNews.map(n => `- [${n.date}] ${n.title}`).join('\n');
      }
    } catch (newsError) {
      console.warn("Erro ao buscar notícias (seguiremos sem elas):", newsError);
    }

    // --- PASSO 2: GERAR RESUMO COM CONTEXTO REAL ---
    const prompt = `
      Atue como um analista financeiro sênior da Bolsa Brasileira (B3).
      Analise o ativo: "${name}" (Ticker: ${ticker}).

      Use as seguintes NOTÍCIAS RECENTES reais como base para o campo "Contexto Recente":
      ---
      ${newsContext}
      ---

      REGRAS DE IDENTIDADE (Anti-Alucinação):
      1. Ticker final 34 = BDR (Empresa Estrangeira).
      2. Ticker final 11 = Verifique se é FII (Imobiliário), Unit ou ETF.
      3. Se não houver notícias relevantes acima, fale sobre o setor em geral.

      Estrutura da resposta (Markdown):
      1. **O que é:** Definição técnica precisa do ativo.
      2. **Setor:** Setor de atuação.
      3. **Contexto Recente:** Resuma os eventos das notícias acima em 1 frase coesa. Se as notícias forem ruins, diga. Se forem boas, diga. (Não cite datas exatas, sintetize o momento).

      Máximo de 150 palavras. Tom profissional.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, // Baixa temperatura para ser fiel às notícias
        max_tokens: 300
      })
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    return res.status(200).json({ summary: data.choices[0].message.content });

  } catch (error) {
    console.error("Erro Geral:", error);
    return res.status(500).json({ error: "Erro ao gerar análise." });
  }
};
