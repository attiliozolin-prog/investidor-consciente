// api/esg-scoring.js
// Motor de Scoring ESG Livo v2.1 (Com Dossiê de Penalidades Real)

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=43200');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // --- 1. BASE DE DADOS POSITIVA (SELOS B3) ---
  const B3_DATA = {
    ISE: ['WEGE3', 'ITUB4', 'SUZB3', 'VALE3', 'NATU3', 'KLBN11', 'TIMS3', 'VIVT3', 'EGIE3', 'LREN3', 'MGLU3', 'B3SA3', 'CCRO3', 'ELET3', 'CMIG4'],
    ICO2: ['WEGE3', 'ITUB4', 'VALE3', 'PETR4', 'GGBR4', 'CSNA3', 'JBSS3', 'BRFS3', 'SUZB3', 'KLBN11'],
    IDIVERSA: ['B3SA3', 'BBAS3', 'ITUB4', 'LREN3', 'MGLU3', 'VIVT3', 'TIMS3', 'WEGE3', 'RAIL3'],
    IGCT: ['ABEV3', 'B3SA3', 'BBAS3', 'BPAC11', 'ITUB4', 'WEGE3', 'RENT3', 'RADL3', 'HAPV3'],
    IGPTW: ['ITUB4', 'BBSE3', 'VIVT3', 'TIMS3', 'MGLU3', 'CIEL3']
  };

  // --- 2. DOSSIÊ DE PENALIDADES (DADOS REAIS 2024-2026) ---
  const PENALTY_DB = {
    // ESCÂNDALOS AMBIENTAIS (IBAMA/MPF)
    'VALE3': [
      { type: 'PENALTY', desc: 'Desastres de Mariana/Brumadinho (Passivo Ambiental)', val: -40, source: 'IBAMA/Justiça' },
      { type: 'PENALTY', desc: 'Inclusão na Lista Suja do Trabalho Escravo (2024)', val: -50, source: 'MTE' } // Kill Switch trigger potential
    ],
    'BRKM5': [
      { type: 'PENALTY', desc: 'Desastre de Maceió (Afundamento de Solo)', val: -60, source: 'Defesa Civil/MPF' }
    ],
    'PETR4': [
      { type: 'PENALTY', desc: 'Multas Ambientais Recentes (Foz do Amazonas)', val: -15, source: 'IBAMA (2026)' },
      { type: 'PENALTY', desc: 'Risco de Governança (Interferência Política)', val: -10, source: 'Mercado' }
    ],
    'JBSS3': [
      { type: 'PENALTY', desc: 'Multa por compra de gado em área desmatada', val: -25, source: 'IBAMA (Carne Fria 2)' },
      { type: 'PENALTY', desc: 'Subsidiária na Lista Suja do Trabalho Escravo', val: -30, source: 'MTE/Justiça' }
    ],
    'MRFG3': [
      { type: 'PENALTY', desc: 'Multa por compra de gado em área desmatada', val: -20, source: 'IBAMA (Carne Fria 2)' }
    ],

    // ESCÂNDALOS ECONÔMICOS (CADE) E GOVERNANÇA (CVM)
    'AMER3': [
      { type: 'PENALTY', desc: 'Fraude Contábil Bilionária (Recuperação Judicial)', val: -80, source: 'CVM/Justiça' } // Praticamente zera a nota
    ],
    'IRBR3': [
      { type: 'PENALTY', desc: 'Histórico de Fraude Contábil e Desconfiança', val: -30, source: 'CVM' }
    ],
    'CVCB3': [
      { type: 'PENALTY', desc: 'Erros Contábeis e Processos contra ex-gestores', val: -25, source: 'CVM' }
    ],
    'QUAL3': [
      { type: 'PENALTY', desc: 'Histórico de Governança Frágil (Caso Fundador)', val: -30, source: 'Polícia Federal/CVM' }
    ],
    'B3SA3': [
      { type: 'PENALTY', desc: 'Investigação por Práticas Anticompetitivas', val: -15, source: 'CADE (2025)' }
    ],
    'GOLL4': [
      { type: 'PENALTY', desc: 'Recuperação Judicial (Chapter 11) e Governança', val: -30, source: 'Justiça' }
    ]
  };

  const SCORE_RULES = [
    { code: 'ISE', weight: 35, label: 'Selo ISE (Sustentabilidade)' },
    { code: 'ICO2', weight: 15, label: 'Selo ICO2 (Carbono Eficiente)' },
    { code: 'IDIVERSA', weight: 15, label: 'Selo IDIVERSA (Diversidade)' },
    { code: 'IGCT', weight: 15, label: 'Selo IGCT (Governança)' },
    { code: 'IGPTW', weight: 10, label: 'Selo GPTW (Melhores Empresas)' }
  ];

  try {
    const uniqueTickers = new Set();
    Object.values(B3_DATA).flat().forEach(t => uniqueTickers.add(t));
    Object.keys(PENALTY_DB).forEach(t => uniqueTickers.add(t));

    const scores = Array.from(uniqueTickers).map(ticker => {
      let rawScore = 50; // Nota Base Neutra
      let evidenceLog = [];

      evidenceLog.push({ type: 'BASE', desc: 'Nota Inicial Neutra', val: 50 });

      // 1. Aplicação de Bônus
      let badges = [];
      SCORE_RULES.forEach(rule => {
        if (B3_DATA[rule.code]?.includes(ticker)) {
          rawScore += rule.weight;
          badges.push(rule.code);
          evidenceLog.push({ type: 'BONUS', desc: rule.label, val: rule.weight });
        }
      });

      // 2. Aplicação de Penalidades
      if (PENALTY_DB[ticker]) {
        PENALTY_DB[ticker].forEach(penalty => {
          rawScore += penalty.val; // Soma o valor negativo
          evidenceLog.push(penalty);
          badges.push('ALERTA');
        });
      }

      // 3. Trava de Segurança (0 a 100)
      const finalScore = Math.min(100, Math.max(0, rawScore));

      return {
        ticker: ticker,
        score: finalScore,
        score_raw: rawScore,
        badges: badges,
        evidence_log: evidenceLog
      };
    });

    return res.status(200).json({ 
      source: "Livo Hybrid Engine v2.1 (Real Data)",
      data: scores 
    });

  } catch (error) {
    console.error("Erro no Scoring:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
};
