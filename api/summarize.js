// api/summarize.js
// Conecta com a OpenAI para gerar resumos inteligentes (Versão Anti-Alucinação)

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
    // PROMPT REFINADO (ANTI-ALUCINAÇÃO)
    // Adicionamos regras de lógica da B3 para ajudar a IA a não errar o tipo de ativo.
    const prompt = `
      Atue como um analista financeiro sênior especializado na Bolsa Brasileira (B3).
      Sua tarefa é explicar o ativo: "${name}" (Ticker: ${ticker}).

      REGRAS CRÍTICAS DE IDENTIFICAÇÃO (Siga estritamente):
      1. Se o ticker termina em **34** (ex: AMZO34, TSLA34, AAPL34), ISSO É UM **BDR** (Brazilian Depositary Receipt) de uma empresa estrangeira. NÃO é um Fundo Imobiliário.
      2. Se o ticker termina em **11**, verifique se é um Fundo Imobiliário (FII), uma Unit ou um ETF.
      3. Se o nome for desconhecido, baseie-se no Ticker.

      Estrutura da resposta (Markdown leve):
      1. **O que é:** Defina o ativo com precisão técnica (ex: "É um BDR que representa ações da Amazon...", "É uma ação ordinária da...", "É um Fundo Imobiliário focado em...").
      2. **Setor:** O setor de atuação real da empresa subjacente.
      3. **Contexto:** Uma frase sobre o momento atual da empresa ou do setor (contexto global se for BDR).

      Seja direto, educativo e profissional. Máximo de 150 palavras.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Modelo rápido e inteligente
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, // Baixei a temperatura para 0.3 para ela ser MENOS criativa e MAIS exata
        max_tokens: 300
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
    return res.status(500).json({ error: "Não foi possível gerar a análise no momento." });
  }
};
