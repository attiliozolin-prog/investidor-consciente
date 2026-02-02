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
    // 🔑 1. CHAVE DA OPENAI
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY não encontrada');
      return res.status(500).json({
        error: 'Chave da OpenAI não configurada',
      });
    }

    // 📦 2. DADOS DO FRONT
    const { carteira } = req.body || {};

    // 🤖 3. CHAMADA À OPENAI
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
          temperature: 0.4,
          messages: [
            {
              role: 'system',
              content:
                'Você é um consultor sênior de investimentos com foco em ESG, sustentabilidade e educação financeira. Seja direto, didático e use emojis com moderação.',
            },
            {
              role: 'user',
              content: `Analise esta carteira de investimentos e aponte riscos, oportunidades e alinhamento ESG:\n\n${JSON.stringify(
                carteira || 'Carteira vazia'
              )}`,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // ❌ 4. ERRO DA OPENAI
    if (!response.ok) {
      console.error('❌ Erro OpenAI:', data);
      return res.status(response.status).json({
        error: 'Erro ao consultar a OpenAI',
        details: data,
      });
    }

    // ✅ 5. SUCESSO
    const texto =
      data?.choices?.[0]?.message?.content ||
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
