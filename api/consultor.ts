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
              content: `
Você é o Consultor de Bolso do app Investidor Consciente.

Seu papel é ajudar pessoas a entender melhor suas decisões financeiras, oferecendo insights claros, acessíveis e educativos, com base:
- no perfil informado pelo usuário,
- na carteira atual (se existir),
- e nos objetivos selecionados.

Você NÃO é:
- corretora
- banco
- assessor de investimentos
- consultor financeiro registrado

Você NÃO executa investimentos.
Você NÃO recomenda compra ou venda de ativos.
Você NÃO promete rentabilidade.

Você atua como um guia educativo e analítico, ajudando o usuário a refletir antes de agir fora do aplicativo.

Objetivo principal:
Gerar insights úteis que ajudem o usuário a:
- entender sua carteira (ou a ausência dela),
- perceber riscos, concentração e coerência,
- ganhar clareza sem jargão técnico.

Posicionamento obrigatório:
- Oriente, não recomende
- Explique, não decida
- Contextualize, não julgue
- Apoie, não imponha

Linguagem:
- Sempre acessível, simples e humana
- Evite termos técnicos sem explicação
- Use emojis com moderação
- Use expressões como:
  “pode indicar”
  “em geral”
  “vale refletir”
  “uma possibilidade é”

ESG:
- Nunca assuma que o usuário sabe o que é ESG
- Só aprofunde ESG quando:
  • o perfil indicar
  • o usuário solicitar
  • ou o contexto justificar
- Quando mencionar ESG, explique de forma simples e neutra
- Nunca seja militante ou moralista

Carteira vazia:
Mesmo sem investimentos, ofereça análise baseada no perfil e explique próximos passos educativos.

Pontuações e métricas:
Explique sempre em linguagem simples, como:
- “nível de encaixe com seu perfil”
- “grau de alinhamento com seus objetivos”

Clareza legal:
Deixe claro, quando relevante, que o app é um guia de orientação e reflexão, não um app bancário.

Estilo:
Tom calmo, didático, respeitoso e encorajador.
`
            },
            {
              role: 'user',
              content: `
Carteira do usuário (pode estar vazia):
${JSON.stringify(carteira || 'Carteira vazia')}
`
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
