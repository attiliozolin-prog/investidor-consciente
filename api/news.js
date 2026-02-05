// api/news.js - Versão InfoMoney (Mais estável)
module.exports = async (req, res) => {
  // 1. Configurar Permissões (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('Chave OpenAI não configurada na Vercel');

    // 2. Buscar Notícias Reais (Fonte: InfoMoney Economia)
    // InfoMoney é mais focado em investimentos e bloqueia menos que o Google
    const rssUrl = "https://www.infomoney.com.br/feed/";
    
    const rssResponse = await fetch(rssUrl, {
      headers: {
        // Finge ser um navegador para evitar bloqueio (Erro 400/403)
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!rssResponse.ok) {
      throw new Error(`Fonte recusou conexão: ${rssResponse.status}`);
    }

    const xmlText = await rssResponse.text();

    // 3. Extrair Links e Títulos
    const items = xmlText.split('<item>').slice(1, 12); // Pega os 12 primeiros
    
    const rawNews = items.map(item => {
      // Regex para limpar CDATA (comum no InfoMoney)
      const titleMatch = item.match(/<title>(.*?)<\/title>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      
      let title = titleMatch ? titleMatch[1] : 'Sem título';
      let link = linkMatch ? linkMatch[1] : '#';

      // Remove tags CDATA se existirem
      title = title.replace('<![CDATA[', '').replace(']]>', '');
      
      return { title, link };
    }).filter(n => n.title !== 'Sem título');

    // 4. Inteligência Artificial (Curadoria)
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
            content: `Você é um Editor Sênior de Investimentos.
            Analise a lista de notícias (InfoMoney) e selecione as 3 mais importantes.
            
            REGRAS:
            1. A 1ª notícia DEVE ter viés de Sustentabilidade/ESG/Futuro ou Macroeconomia importante.
            2. Resuma o impacto em 1 frase curta.
            3. Retorne APENAS um JSON array válido:
            [{"title": "Título Resumido", "source": "InfoMoney", "impact": "Impacto direto", "url": "Link original"}]`
          },
          {
            role: 'user',
            content: JSON.stringify(rawNews)
          }
        ]
      })
    });

    const aiData = await aiResponse.json();
    
    if (aiData.error) throw new Error(aiData.error.message);

    // Limpeza da resposta
    let content = aiData.choices[0].message.content;
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const news = JSON.parse(content);

    return res.status(200).json({ news });

  } catch (error) {
    console.error("Erro na API:", error);
    // Fallback elegante (Mostra erro mas não quebra)
    return res.status(200).json({ 
      news: [
        { 
          title: "Mercado Financeiro hoje", 
          source: "Sistema", 
          impact: "Não foi possível carregar as notícias em tempo real.", 
          url: "https://www.infomoney.com.br" 
        }
      ] 
    });
  }
};
