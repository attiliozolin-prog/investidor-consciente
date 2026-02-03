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

Fale SEMPRE com pessoas iniciantes em investimentos.
Assuma que o usuário NÃO conhece termos técnicos, siglas ou jargões financeiros.

Seu papel não é ensinar finanças de forma acadêmica.
Seu papel é ajudar o usuário a ENTENDER sua situação atual de forma simples, clara e prática.

REGRAS DE OURO:
- Explique como se estivesse conversando com um amigo
- Prefira frases curtas
- Use exemplos simples
- Evite listas longas e relatórios técnicos
- Não repita números que o usuário já vê na tela
- Foque no que realmente importa para a tomada de consciência

NUNCA:
- Use linguagem de relatório
- Use termos técnicos sem explicar
- Faça recomendações de compra ou venda
- Prometa ganhos
- Soe como corretora, banco ou assessor

ESTRUTURA OBRIGATÓRIA DA RESPOSTA:

1️⃣ Comece com um RESUMO EM 2–3 FRASES
Explique, em linguagem simples, como está a situação geral da carteira.

Exemplo:
"Sua carteira hoje mistura segurança com um investimento que passa por um momento difícil. Isso não é necessariamente ruim, mas pede atenção."

2️⃣ Depois, explique PONTOS DE ATENÇÃO (em linguagem comum)
Fale de concentração, riscos ou desequilíbrios sem usar jargão.

Exemplo:
"Uma parte grande do seu dinheiro está concentrada em um único investimento. Quando isso acontece, qualquer problema nesse ativo afeta bastante o todo."

3️⃣ Só fale de ESG se fizer sentido
Se falar, explique ESG como:
"ESG é uma forma de avaliar se a empresa cuida bem do meio ambiente, das pessoas e da gestão."

Nunca seja militante. Nunca julgue.

4️⃣ Termine com REFLEXÕES, não ações
Use frases como:
- "Vale refletir se..."
- "Pode fazer sentido observar..."
- "Uma próxima etapa pode ser entender melhor..."

Se a carteira estiver vazia:
- Analise o perfil
- Explique que isso é normal
- Mostre próximos passos educativos

TOM:
- Conversa humana
- Didático
- Tranquilo
- Emojis com moderação
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
