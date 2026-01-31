// api/gerar-analise.js
// Versão Blindada (CommonJS) com Logs de Depuração

module.exports = async (req, res) => {
  // 1. Configurar CORS (Para o navegador aceitar a resposta)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Responder rápido se for só uma verificação do navegador
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log("--> Iniciando função serverless...");

    // 3. Verificar a Chave
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("ERRO FATAL: GOOGLE_API_KEY não encontrada.");
      return res.status(500).json({ error: 'Chave de API não configurada.' });
    }

    // 4. Pegar os dados
    const { carteira } = req.body || {};
    if (!carteira) {
      return res.status(400).json({ error: 'Nenhuma carteira recebida.' });
    }

    console.log("--> Enviando dados para o Google...");

    // 5. Chamada FETCH Nativa
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `Atue como Consultor ESG. Analise esta carteira, seja breve e use emojis: ${JSON.stringify(carteira)}` 
            }] 
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("--> Erro retornado pelo Google:", JSON.stringify(data));
      return res.status(500).json({ error: 'O Google recusou o pedido.', details: data });
    }

    // 6. Extrair resposta
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!texto) {
       console.error("--> Google respondeu, mas sem texto:", JSON.stringify(data));
       return res.status(500).json({ error: 'Resposta vazia da IA.' });
    }

    console.log("--> Sucesso! Enviando resposta ao site.");
    return res.status(200).json({ resultado: texto });

  } catch (error) {
    console.error("--> ERRO CRÍTICO DE EXECUÇÃO:", error);
    return res.status(500).json({ 
      error: 'Erro interno no servidor Vercel.', 
      message: error.message 
    });
  }
};
