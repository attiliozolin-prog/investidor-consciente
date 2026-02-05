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

    // 1. BUSCAR RSS (Google News Finanças)
    const rssUrl = "https://news.google.com/rss/topics/CAAqJggBCiCPASowCAcLCzcN-ADsAAoSEQgCKhAIAlIWCg0iBAiEAxAGGAE?hl=pt-BR&gl=BR&ceid=BR%3Apt-419";
    const rssResponse = await fetch(rssUrl);
    const xmlText = await rssResponse.text();

    // 2. EXTRAÇÃO INTELIGENTE (TÍTULO + LINK)
    // Extraímos os itens brutos para garantir que o link venha junto
    const items = xmlText.split('<item>');
    const rawNews = items.slice(1, 15).map(item => {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
      return { title: title.replace(' - Google News', ''), link };
    }).filter(n => n.title && n.link);

    // 3. CURADORIA RIGOROSA DA IA
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
          temperature: 0.3,
          messages: [
            {
              role: 'system',
              content: `Você é um Editor Sênior de Investimentos ESG.
              
              SUA MISSÃO:
              Analise a lista de notícias fornecida (Título + Link) e selecione EXATAMENTE 3 notícias.
              
              REGRAS DE SELEÇÃO (PRIORIDADE MÁXIMA):
              1. A primeira notícia DEVE OBRIGATORIAMENTE ser sobre Sustentabilidade, Clima, Energia Renovável ou Governança (ESG). Se não houver explícita, pegue a que mais se aproxima (ex: impacto social, agro, regulação).
              2. As outras 2 devem ser as mais impactantes para o bolso do investidor (Juros, Inflação, Dólar).
              3. Você DEVE retornar o LINK original fornecido na entrada.
              
              FORMATO DE SAÍDA (JSON ARRAY):
              [
                { 
                  "title": "Título resumido (máx 60 chars)", 
                  "source": "Nome do Veículo (ex: G1, Valor)",
                  "impact": "Explicação curta do impacto (máx 10 palavras).",
                  "url": "O link original exato que eu te mandei"
                }
              ]`
            },
            {
              role: 'user',
              content: `Lista de Notícias:\n${JSON.stringify(rawNews)}`
            },
          ],
        }),
      }
    );

    const data = await response.json();
    
    // Tratamento de JSON
    const rawContent = data.choices[0].message.content;
    const jsonString = rawContent.replace(/```json|```/g, '').trim();
    const news = JSON.parse(jsonString);

    return res.status(200).json({ news });

  } catch (error: any) {
    console.error('Erro News:', error);
    return res.status(200).json({ 
      news: [
        { 
          title: "Mercado analisa Copom e Juros", 
          source: "Banco Central", 
          impact: "Volatilidade na Renda Fixa.", 
          url: "https://www.bcb.gov.br" 
        },
        { 
          title: "Avanço da Energia Limpa no Brasil", 
          source: "Setor Elétrico", 
          impact: "Oportunidade em ações de utilidade pública.", 
          url: "#" 
        },
        { 
          title: "Bolsa fecha em alta", 
          source: "B3", 
          impact: "Bons resultados corporativos.", 
          url: "https://www.b3.com.br" 
        }
      ] 
    });
  }
}
