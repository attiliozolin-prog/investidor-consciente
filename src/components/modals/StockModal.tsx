import React, { useState } from "react";
import { X, Leaf, AlertTriangle, Info, ShieldCheck, Activity, Building2 } from "lucide-react";
import { StockData, UserProfile } from "../../types";
import { CERTIFICATIONS_DICT, FINANCIAL_TERMS } from "../../data/definitions";

interface Props {
  stock: StockData;
  user: UserProfile;
  coherenceScore: number;
  onClose: () => void;
}

const StockModal: React.FC<Props> = ({ stock, user, coherenceScore, onClose }) => {
  const getScoreTheme = (score: number) => {
    if (score >= 70) return {
      bg: "bg-emerald-50", text: "text-emerald-900", border: "border-emerald-100",
      icon: <ShieldCheck className="text-emerald-600" size={24} />,
      title: "Alta Coerência",
      msg: `Excelente alinhamento com seu perfil ${user.riskProfile || ''}.`
    };
    if (score >= 40) return {
      bg: "bg-yellow-50", text: "text-yellow-900", border: "border-yellow-100",
      icon: <Info className="text-yellow-600" size={24} />,
      title: "Atenção Moderada",
      msg: "Este ativo possui pontos de atenção em relação aos seus valores."
    };
    return {
      bg: "bg-red-50", text: "text-red-900", border: "border-red-100",
      icon: <AlertTriangle className="text-red-600" size={24} />,
      title: "Baixa Coerência",
      msg: "Cuidado: Ativo com poucos indicadores de sustentabilidade ou governança."
    };
  };

  const theme = getScoreTheme(coherenceScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <div className="w-14 h-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden p-1 shadow-sm">
                {/* LÓGICA DUPLA DE LOGO: Tenta Brapi, se falhar, tenta Google, se falhar mostra Texto */}
                <img 
                  src={stock.ticker ? `https://raw.githubusercontent.com/thecapybara/br-logos/main/logos/${stock.ticker}.png` : ''}
                  onError={(e) => {
                    // Fallback para Google Favicon se o repo do GitHub falhar
                    e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${stock.name}.com.br&sz=64`;
                    e.currentTarget.onerror = null; // Evita loop infinito
                  }}
                  alt={stock.ticker} 
                  className="w-full h-full object-contain" 
                />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                 {stock.ticker}
                 {stock.esgScore >= 80 && <Leaf size={18} className="text-emerald-500" fill="currentColor"/>}
               </h2>
               <p className="text-sm text-gray-500 line-clamp-1">{stock.name}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* 1. SCORE CARD */}
          <div className={`p-5 rounded-2xl border ${theme.bg} ${theme.border}`}>
            <div className="flex items-start gap-4">
               <div className="mt-1 shrink-0">{theme.icon}</div>
               <div>
                 <h3 className={`font-bold text-lg ${theme.text}`}>Coerência Livo: {coherenceScore}%</h3>
                 <p className={`text-sm ${theme.text} opacity-90 mt-1 leading-relaxed`}>
                   {theme.msg}
                 </p>
               </div>
            </div>
          </div>

          {/* 2. CREDENCIAIS ESG (APENAS ÍNDICES) */}
          <div>
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Leaf size={18} className="text-emerald-600"/> Índices e Selos B3
            </h4>
            
            {stock.tags && stock.tags.length > 0 ? (
              <div className="space-y-2">
                {stock.tags.map(tag => (
                  <div key={tag} className="group relative bg-white p-3 rounded-xl border border-emerald-100 hover:border-emerald-300 transition-colors shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        ✅ {tag}
                      </span>
                      <Info size={14} className="text-emerald-400 cursor-help" />
                    </div>
                    {/* Tooltip Explicativo */}
                    <div className="hidden group-hover:block absolute z-20 bottom-full left-0 mb-2 w-full bg-gray-800 text-white text-xs p-3 rounded-lg shadow-xl">
                      {CERTIFICATIONS_DICT[tag] || "Certificação de mercado reconhecida."}
                      <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-3 items-center">
                 <Building2 className="text-gray-300" size={24} />
                 <p className="text-xs text-gray-500 leading-relaxed">
                   Esta empresa ainda não faz parte dos principais índices de sustentabilidade da B3 (ISE, ICO2, IGPTW).
                 </p>
              </div>
            )}
          </div>

          {/* 3. INDICADORES FINANCEIROS */}
          <div>
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Activity size={18} className="text-blue-600"/> Indicadores
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Preço", value: `R$ ${stock.price?.toFixed(2) || '---'}`, icon: null },
                { label: "DY (12m)", value: stock.dividendYield ? `${stock.dividendYield}%` : '-', help: "DY" },
                { label: "P/L", value: stock.peRatio || '-', help: "P/L" },
                { label: "ROE", value: stock.roe ? `${stock.roe}%` : '-', help: "ROE" },
              ].map((item: any) => (
                <div key={item.label} className="bg-gray-50 p-3 rounded-xl border border-gray-100 relative group">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{item.label}</p>
                    {item.help && (
                       <div className="relative">
                         <Info size={12} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                         {/* TOOLTIP CORRIGIDO: Right-0 para não cortar */}
                         <div className="absolute bottom-full right-0 mb-2 w-40 bg-gray-900 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl">
                            {FINANCIAL_TERMS[item.help]}
                         </div>
                       </div>
                    )}
                  </div>
                  <p className="text-lg font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StockModal;
