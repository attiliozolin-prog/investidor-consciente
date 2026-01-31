// api/consultor.js
// Versão: Limpeza de Chave + Modelo Flash 1.5

module.exports = async (req, res) => {
  // Configuração de permissões (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Responde rápido se o navegador só estiver testando a conexão
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 1. RECUPERAÇÃO E LIMPEZA DA CHAVE
    // O .trim() é vital: remove espaços invisíveis ou quebras de linha que causam Erro 400
    const rawKey = process.env.MINHA_CHAVE || process.env.GOOGLE_API_KEY;
    const apiKey = rawKey ? rawKey.trim() : "";
    
    if (!apiKey) {
      console.error("--> [ERRO] Nenhuma chave encontrada nas variáveis.");
      return res.status(500).json({ error: 'Chave API não configurada.' });
    }

    const { carteira } = req.body || {};

    // 2. CONEXÃO COM O GOOGLE (Voltando para o modelo Flash 1.5)
    // O modelo 'gemini-pro' antigo estava dando 404 (Não encontrado)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `Atue como Consultor ESG Sênior. Analise esta carteira de forma direta, use emojis e foque em sustentabilidade: ${JSON.stringify(carteira || "Carteira Vazia")}` 
            }] 
          }]
        })
      }
    );

    const data = await response.json();

    // 3. TRATAMENTO DE ERROS DO GOOGLE
    if (!response.ok) {
      console.error("--> [ERRO GOOGLE]", JSON.stringify(data));
      // Se der erro, mostramos o motivo exato (ex: chave inválida, modelo não existe)
      return res.status(response.status).json({ 
        error: 'O Google rejeitou o pedido.', 
        google_message: data.error?.message || 'Erro desconhecido'
      });
    }

    // 4. SUCESSO
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ resultado: texto });

  } catch (error) {
    console.error("--> [ERRO INTERNO]", error);
    return res.status(500).json({ error: error.message });
  }
};
