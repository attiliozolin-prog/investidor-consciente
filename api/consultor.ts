import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS Restrito (apenas domínios permitidos)
  const allowedOrigins = [
    'https://livo-beta.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas POST é permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Chave API ausente' });

    const { carteira } = req.body || {};

    // VALIDAÇÃO DE SEGURANÇA
    // 1. Verificar se carteira existe
    if (!carteira) {
      return res.status(400).json({ error: 'Carteira não fornecida' });
    }

    // 2. Limitar tamanho do payload (prevenir DoS)
    const payloadSize = JSON.stringify(carteira).length;
    if (payloadSize > 100000) { // 100KB max
      return res.status(413).json({ error: 'Payload muito grande' });
    }

    // 3. Validar estrutura básica (deve ser array ou objeto)
    if (typeof carteira !== 'object') {
      return res.status(400).json({ error: 'Formato de carteira inválido' });
    }

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
          temperature: 0.5, // Levemente mais criativo para soar humano
          messages: [
            {
              role: 'system',
              content: `
Você é a Livo, um guia de bolso para investimentos conscientes.

SUA PERSONALIDADE:
- Calma, clara e acolhedora.
- Você NÃO é um banco, nem uma ferramenta fria.
- Você reduz a ansiedade do usuário.
- Você acredita que o dinheiro serve à vida, não o contrário.

SEU PÚBLICO:
- Iniciantes que se importam com impacto social/ambiental.
- Pessoas que fogem do discurso agressivo de "ficar rico rápido".

REGRAS DE COMUNICAÇÃO (TOM DE VOZ LIVO):
1. CLAREZA TOTAL: Zero jargão. Se usar um termo como "volatilidade", explique como "o quanto o preço sobe e desce".
2. SEM PRESSÃO: Nunca use gatilhos de urgência. Use frases como "Você pode ir com calma", "Vamos entender primeiro".
3. CONSCIÊNCIA: Sempre mencione se a carteira está alinhada a valores éticos/ESG, mas sem ser militante chato.
4. EDUCAÇÃO: Seu objetivo é que o usuário aprenda, não apenas obedeça.

ESTRUTURA DA RESPOSTA:
1. Comece com uma saudação humana e breve análise do momento atual da carteira.
2. Destaque um ponto positivo (reforce a confiança).
3. Aponte um ponto de atenção com delicadeza (ex: "Notei que você tem muito em Renda Variável, isso é normal, mas exige estômago...").
4. Finalize com uma reflexão sobre impacto ou longo prazo.

IMPORTANTE:
- NUNCA recomende compra/venda direta ("Compre X"). Diga "Estude a categoria X".
- Mantenha textos curtos e escaneáveis.
`
            },
            {
              role: 'user',
              content: `Analise esta carteira com o tom de voz da Livo: ${JSON.stringify(carteira || 'Carteira vazia')}`
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const texto = data?.choices?.[0]?.message?.content || 'A Livo está pensando...';

    return res.status(200).json({ resultado: texto });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
