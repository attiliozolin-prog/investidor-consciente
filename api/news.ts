import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Configuração CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('Chave OpenAI ausente');

    // 1. BUSCAR DADOS REAIS (RSS Google News - Negócios Brasil)
    // Usamos o RSS porque é gratuito, rápido e confiável
    const rssUrl = "https://news.google.com/rss/topics/CAAqJggBCiCPASowCAcLCzcN-ADsAAoSEQgCKhAIAlIWCg0iBAiEAxAGGAE?hl=pt-BR&gl=BR&ceid=BR%3Apt-419";
    const rssResponse = await fetch(rssUrl);
    const xmlText = await rssResponse.text();

    // 2. EXTRAÇÃO SIMPLES (Limpar o XML para não gastar tokens)
    // Pegamos apenas os primeiros 15 títulos para a IA analisar
    const titles = xmlText
      .match(/<title>(.*?)<\/title>/g)
      ?.map(t => t.replace(/<\/?title>/g, '').replace(' - Google News', ''))
      .slice(1, 15) // Pula o título do feed e pega 15 notícias
      .join('\n');

    if (!titles) throw new Error("Não foi possível buscar notícias");

    // 3. CURADORIA DA IA
    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.3, // Baixa criatividade para ser fiel aos fatos
          messages: [
            {
              role: 'system',
              content: `Você é um Editor Chefe de Finanças ESG.
              Sua missão: Ler as manchetes abaixo e selecionar as 3 mais relevantes para um investidor consciente/ESG no Brasil.
              Se não houver nada especificamente ESG, escolha as mais impactantes para a economia geral (Juros, Inflação, Bolsa).
              
              Saída OBRIGATÓRIA em JSON puro (Array de objetos):
              [
                { 
                  "title": "Título curto e chamativo (máx 50 caracteres)", 
                  "source": "Fonte Original (ex: G1, InfoMoney)",
                  "impact": "1 frase curta explicando o impacto no bolso ou no mundo." 
                }
              ]`
            },
            {
              role: 'user',
              content: `Manchetes Brutas:\n${titles}`
            },
          ],
        }),
      }
    );

    const data = await response.json();
    
    // Tratamento para extrair o JSON da resposta da IA
    const rawContent = data.choices[0].message.content;
    const jsonString = rawContent.replace(/```json|```/g, '').trim();
    const news = JSON.parse(jsonString);

    return res.status(200).json({ news });

  } catch (error: any) {
    console.error('Erro News:', error);
    // Fallback: Se der erro, retorna notícias genéricas para não quebrar a UI
    return res.status(200).json({ 
      news: [
        { title: "Mercado analisa Copom", source: "Banco Central", impact: "Decisão de juros impacta Renda Fixa." },
        { title: "Bolsa oscila hoje", source: "B3", impact: "Volatilidade normal do mercado." }
      ] 
    });
  }
}
