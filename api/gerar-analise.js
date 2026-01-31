// api/gerar-analise.js
// Versão DEBUG: Lista quais chaves o servidor consegue ver

module.exports = async (req, res) => {
  // Configuração CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log("--> [DEBUG] Iniciando...");
    
    // O GRAMPO: Vamos ver o que tem no cofre (sem mostrar as senhas, só os nomes)
    const chavesVisiveis = Object.keys(process.env);
    console.log("--> [DEBUG] Chaves encontradas no servidor:", JSON.stringify(chavesVisiveis));

    const apiKey = process.env.GOOGLE_API_KEY;
    
    // Verificação extra de limpeza
    if (!apiKey || apiKey.trim() === "") {
      console.error("--> [ERRO] A chave GOOGLE_API_KEY está vazia ou indefinida.");
      return res.status(500).json({ 
        error: 'Chave de API não encontrada.',
        debug_keys: chavesVisiveis // Devolvemos a lista para você ver no navegador também
      });
    }

    const { carteira } = req.body || {};
    if (!carteira) {
      return res.status(400).json({ error: 'Carteira não recebida.' });
    }

    console.log("--> [DEBUG] Chave ok. Chamando Google...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `Atue como Consultor ESG Sênior. Analise esta carteira (seja breve, use emojis): ${JSON.stringify(carteira)}` 
            }] 
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("--> [ERRO GOOGLE]", JSON.stringify(data));
      return res.status(500).json({ error: 'Erro na resposta da IA', details: data });
    }

    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ resultado: texto });

  } catch (error) {
    console.error("--> [ERRO CRÍTICO]", error);
    return res.status(500).json({ error: 'Erro interno.', message: error.message });
  }
};
