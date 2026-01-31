// api/gerar-analise.js
// Usamos 'require' em vez de 'import' para garantir compatibilidade total
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  // 1. Verificações de Segurança
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave de API não configurada no servidor.' });
  }

  try {
    // 2. Configura a IA
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Recebe os dados
    const { carteira } = req.body;
    if (!carteira) {
      return res.status(400).json({ error: 'Carteira não informada.' });
    }

    // 4. Prepara o prompt
    const prompt = `
      Atue como um Consultor Financeiro ESG Sênior.
      Analise esta carteira de investimentos: ${JSON.stringify(carteira)}.
      
      Foque em:
      1. Diversificação (Risco).
      2. Pontuação ESG (Sustentabilidade).
      3. Sugira 1 mudança prática para melhorar o impacto positivo.
      
      Seja direto, curto e encorajador. Use emojis.
    `;

    // 5. Gera a resposta
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ resultado: text });

  } catch (error) {
    console.error("Erro na API:", error);
    return res.status(500).json({ error: error.message || "Erro interno na IA" });
  }
};
