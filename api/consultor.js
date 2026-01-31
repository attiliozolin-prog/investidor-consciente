// api/consultor.js
// Versão Final: Modelo 'gemini-pro' (Mais estável) + Chave Segura

module.exports = async (req, res) => {
  // Cabeçalhos para o navegador aceitar
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 1. Recupera a chave do cofre (Vercel)
    const apiKey = process.env.MINHA_CHAVE || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error("--> [ERRO] Chave API não encontrada nas variáveis.");
      return res.status(500).json({ error: 'Configuração de chave ausente.' });
    }

    const { carteira } = req.body || {};

    // 2. Chama o Google (Modelo alterado para 'gemini-pro')
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `Atue como Consultor ESG. Analise brevemente: ${JSON.stringify(carteira || "Carteira Teste")}` 
            }] 
          }]
        })
      }
    );

    const data = await response.json();

    // 3. Verifica se o Google rejeitou
    if (!response.ok) {
      console.error("--> [ERRO GOOGLE]", JSON.stringify(data));
      return res.status(500).json({ error: 'O Google está instável (503).', details: data });
    }

    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ resultado: texto });

  } catch (error) {
    console.error("--> [ERRO INTERNO]", error);
    return res.status(500).json({ error: error.message });
  }
};
