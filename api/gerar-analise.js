/ api/gerar-analise.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Configura o Google Gemini com sua chave segura
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    // 2. Recebe a carteira que o usuário mandou
    const { carteira } = req.body;

    // 3. Monta o pedido para a IA
    const prompt = `
      Atue como um Consultor Financeiro ESG Sênior.
      Analise esta carteira de investimentos baseada nestes ativos: ${JSON.stringify(carteira)}.
      
      Foque em:
      1. Diversificação (Risco).
      2. Pontuação ESG (Sustentabilidade).
      3. Sugira 1 mudança prática para melhorar o impacto positivo.
      
      Seja direto, curto e encorajador. Use emojis.
    `;

    // 4. Manda para o Google e espera a resposta
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. Devolve o texto para o site
    res.status(200).json({ resultado: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao falar com a IA" });
  }
}
