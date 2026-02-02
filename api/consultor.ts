import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // --- CORS ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 🔑 1. RECUPERA A CHAVE DA VERCEL
    const apiKey = process.env.GOOGLE_API_KEY?.trim();

    if (!apiKey) {
      console.error('❌ GOOGLE_API_KEY não encontrada');
      return res.status(500).json({
        error: 'Chave da API do Google não configurada',
      });
    }

    // 📦 2. DADOS ENVIADOS PELO FRONT
    const { carteira } = req.body || {};

    // 🤖 3. CHAMADA AO GEMINI
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Atue como Consultor ESG Sênior. Seja direto, use emojis e foque em sustentabilidade. Analise esta carteira:\n\n${JSON.stringify(
                    carteira || 'Carteira vazia'
                  )}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // ❌ 4. ERRO DO GOOGLE
    if (!response.ok) {
      console.error('❌ Erro do Google:', data);
      return res.status(response.status).json({
        error: 'Erro ao consultar o Gemini',
        details: data,
      });
    }

    // ✅ 5. SUCESSO
    const texto =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Nenhuma resposta gerada.';

    return res.status(200).json({ resultado: texto });
  } catch (error: any) {
    console.error('❌ Erro interno:', error);
    return res.status(500).json({
      error: 'Erro interno no servidor',
      message: error.message,
    });
  }
}
