// api/consultor.js
// TESTE RADICAL: Chave direto no código (Apagar logo após o teste!)

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // ⚠️ COLOCAR A CHAVE AQUI APENAS PARA O TESTE
    // Exemplo: const apiKey = "AIzaSyA_AgrLnci...";
    const apiKey = "AIzaSyA_AgrLncivxShnp4S_k_fBXxg-IoyXZ5I"; 

    console.log("--> [TESTE] Usando chave direta (início):", apiKey.substring(0, 5) + "...");

    const { carteira } = req.body || {};
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `Atue como Consultor ESG. Analise: ${JSON.stringify(carteira || "Carteira Teste")}` 
            }] 
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("--> [ERRO GOOGLE]", JSON.stringify(data));
      // Retorna o erro exato do Google para você ver na tela
      return res.status(500).json({ error: 'Erro no Google', details: data });
    }

    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ resultado: texto });

  } catch (error) {
    console.error("--> [ERRO INTERNO]", error);
    return res.status(500).json({ error: error.message });
  }
};
