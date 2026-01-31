// api/gerar-analise.js
// Versão usando HTTP Puro (Sem bibliotecas externas) para evitar erros de versão

export default async function handler(req, res) {
  // 1. Configurar cabeçalhos para evitar erros de CORS (bloqueio de navegador)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Responder ao "sinal de fumaça" do navegador (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. Validar se é POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const { carteira } = req.body;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error('Chave de API não configurada no servidor (Vercel).');
    }

    // 4. Montar o Prompt
    const prompt = `
      Atue como um Consultor Financeiro ESG Sênior.
      Analise esta carteira de investimentos: ${JSON.stringify(carteira)}.
      Foque em:
      1. Diversificação (Risco).
      2. Pontuação ESG (Sustentabilidade).
      3. Sugira 1 mudança prática para melhorar o impacto positivo.
      Seja direto, curto e encorajador. Use emojis.
    `;

    // 5. CHAMADA DIRETA AO GOOGLE (Sem biblioteca)
    // Isso evita o erro de "require vs import"
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    const data = await response.json();

    // 6. Tratamento de Erros do Google
    if (!response.ok) {
      console.error("Erro do Google:", data);
      throw new Error(data.error?.message || 'Erro ao contatar o Google Gemini');
    }

    // 7. Extrair o texto da resposta
    const textoResposta = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ resultado: textoResposta });

  } catch (error) {
    console.error("Erro Geral na API:", error);
    return res.status(500).json({ 
      error: "Erro interno no servidor.", 
      detalhes: error.message 
    });
  }
}
