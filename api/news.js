// api/news.js - Versão "Revista Digital" (Capa + ESG)
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('Chave OpenAI não configurada');

    // 1. Busca no InfoMoney (Melhor fonte para "Capa de Mercado")
    const rssResponse = await fetch("https://www.infomoney.com.br/feed/", {
      headers: { 'User-Agent': 'Mozilla/5.0 (InvestidorConscienteBot)' }
    });

    if (!rssResponse.ok) throw new Error(`Erro Fonte: ${rssResponse.status}`);
    const xmlText = await rssResponse.text();

    // 2. Extração (Pegamos 15 para ter variedade para a IA escolher)
    const items = xmlText.split('<item>').slice(1, 15);
    const rawNews = items.map(item => {
      let title = item.match(/<title>(.*?)<\/title>/)?.[1] || '';
      let link = item.match(/<link>(.*?)<\/link>/)?.[1] || '#';
      // Limpeza de CDATA e sufixos
      title = title.replace('<![CDATA[', '').replace(']]>', '').replace(' - InfoMoney', '');
      return { title, link };
    }).filter(n => n.title.length > 10);

    // 3. IA Editor Chefe
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Atue como Editor Chefe do InfoMoney.
            Analise as manchetes e selecione EXATAMENTE 3 notícias para a home do app.
            
            ORDEM OBRIGATÓRIA:
            1. [CAPA]: A notícia mais bombástica/urgente do dia (Juros, Bolsa, Política Econômica).
            2. [RELEVANTE]: A segunda notícia mais importante para o bolso do investidor.
            3. [ESG]: A melhor notícia sobre Sustentabilidade, Energia Limpa ou Futuro Verde encontrada na lista.
            
            SAÍDA JSON (Array puro):
            [
              { "type": "capa", "title": "...", "source": "InfoMoney", "impact": "Resumo de 1 frase", "url": "..." },
              { "type": "relevante", "title": "...", "source": "InfoMoney", "impact": "Resumo de 1 frase", "url": "..." },
              { "type": "esg", "title": "...", "source": "InfoMoney", "impact": "Resumo de 1 frase", "url": "..." }
            ]`
          },
          { role: 'user', content: JSON.stringify(rawNews) }
        ]
      })
    });

    const aiData = await aiResponse.json();
    let content = aiData.choices[0].message.content.replace(/```json|```/g, '').trim();
    const news = JSON.parse(content);

    return res.status(200).json({ news });

  } catch (error) {
    console.error("Erro API News:", error);
    // Fallback estruturado caso falhe
    return res.status(200).json({ 
      news: [
        { type: "capa", title: "Ibovespa opera com volatilidade de olho no cenário fiscal", source: "Sistema", impact: "Momento de cautela.", url: "#" },
        { type: "relevante", title: "Dólar fecha em leve alta com dados dos EUA", source: "Sistema", impact: "Impacta importações.", url: "#" },
        { type: "esg", title: "Empresas brasileiras batem recorde em energia renovável", source: "Sistema", impact: "Setor aquecido.", url: "#" }
      ] 
    });
  }
};
