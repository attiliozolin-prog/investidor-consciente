// api/summarize.js
// Conecta com a OpenAI para gerar resumos inteligentes

module.exports = async (req, res) => {
  // CORS e Cache
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ticker, name } = req.body;
  
  // Pegue sua chave em https://platform.openai.com/api-keys
  // Adicione no .env da Vercel como OPENAI_API_KEY
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Chave OpenAI não configurada no servidor." });
  }

  try {
    const prompt = `
      Atue como um analista financeiro experiente e direto da Livo.
      Escreva um resumo sobre a empresa "${name}" (Ticker: ${ticker}) listada na B3.
      
      Estrutura da resposta (use Markdown leve):
      1. **O que é:** Explique o modelo de negócio em 1 ou 2 frases simples.
      2. **Setor:** Qual o setor principal.
      3. **Contexto Recente:** Uma frase sobre o momento atual da empresa ou uma notícia relevante recente (sem data, focado em contexto de mercado).

      Mantenha o tom profissional, educativo, mas acessível. Máximo de 150 palavras.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Modelo rápido e barato
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 250
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const summary = data.choices[0].message.content;
    return res.status(200).json({ summary });

  } catch (error) {
    console.error("Erro OpenAI:", error);
    return res.status(500).json({ error: "Não foi possível gerar o resumo agora." });
  }
};
