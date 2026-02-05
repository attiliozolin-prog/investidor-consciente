// api/news.js - Versão JavaScript Robusta com Debug
// Removemos a dependência de TypeScript para evitar erros de build na Vercel

module.exports = async (req, res) => {
  // CORS - Permite que seu site acesse a API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  console.log("--> [API NEWS] Iniciando busca..."); // Log para você ver na Vercel

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("--> [ERRO] Chave OpenAI não encontrada!");
      throw new Error('Chave OpenAI ausente');
    }

    // 1. BUSCAR RSS (Google News)
    console.log("--> [API NEWS] Buscando RSS do Google...");
    const rssUrl = "https://news.google.com/rss/topics/CAAqJggBCiCPASowCAcLCzcN-ADsAAoSEQgCKhAIAlIWCg0iBAiEAxAGGAE?hl=pt-BR&gl=BR&ceid=BR%3Apt-419";
    
    const rssResponse = await fetch(rssUrl);
    if (!rssResponse.ok) {
      throw new Error(`Google News recusou conexão: ${rssResponse.status}`);
    }
    
    const xmlText = await rssResponse.text();
    console.log("--> [API NEWS] RSS recebido. Tamanho:", xmlText.length);

    // 2. EXTRAÇÃO MANUAL (Simples e eficaz)
    // Extrai links e títulos sem precisar de bibliotecas de XML
    const items = xmlText.split('<item>');
    const rawNews = items.slice(1, 12).map(item => {
      // Regex simples para pegar conteúdo entre as tags
      const titleMatch = item.match(/<title>(.*?)<\/title>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      
      return { 
        title: titleMatch ? titleMatch[1].replace(' - Google News', '') : null, 
        link: linkMatch ? linkMatch[1] : null 
      };
    }).filter(n => n.title && n.link);

    console.log("--> [API NEWS] Itens extraídos:", rawNews.length);

    if (rawNews.length === 0) throw new Error("Falha ao extrair itens do XML");

    // 3. ENVIAR PARA OPENAI
    console.log("--> [API NEWS] Enviando para OpenAI...");
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
              content: `Atue como Editor de Finanças ESG.
              Analise esta lista de manchetes e selecione 3 notícias.
              
              REGRAS:
              1. A primeira deve ser sobre Sustentabilidade/ESG/Clima.
              2. As outras 2 sobre economia geral (Juros, Bolsa, Inflação).
              3. Mantenha o link original.
              
              SAÍDA JSON OBRIGATÓRIA:
              [
                { 
                  "title": "Título resumido", 
                  "source": "Fonte (ex: G1)",
                  "impact": "Impacto curto",
                  "url": "Link original"
                }
              ]`
            },
            {
              role: 'user',
              content: JSON.stringify(rawNews)
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("--> [ERRO OPENAI]", JSON.stringify(data.error));
      throw new Error("Erro na API da OpenAI");
    }

    // Tratamento do JSON retornado pela IA
    let content = data.choices[0].message.content;
    // Remove crases se a IA mandar ```json ... ```
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const news = JSON.parse(content);
    console.log("--> [SUCESSO] Notícias processadas:", news.length);

    return res.status(200).json({ news });

  } catch (error) {
    console.error("--> [ERRO FATAL]", error);
    
    // FALLBACK DE EMERGÊNCIA
    // Se der qualquer erro, retornamos notícias estáticas para o site não ficar vazio
    return res.status(200).json({ 
      news: [
        { 
          title: "Mercado analisa cenário econômico (Modo Offline)", 
          source: "Sistema", 
          impact: "Não foi possível conectar às notícias em tempo real.", 
          url: "#" 
        },
        { 
          title: "Oportunidades em Renda Fixa seguem altas", 
          source: "Analista", 
          impact: "Juros elevados favorecem conservadores.", 
          url: "#" 
        }
      ] 
    });
  }
};
