import React, { useState } from "react";
import { X, Leaf, AlertTriangle, Info, ShieldCheck, TrendingUp, DollarSign, Activity } from "lucide-react";
import { StockData, UserProfile } from "../../types";
import { CERTIFICATIONS_DICT, FINANCIAL_TERMS } from "../../data/definitions";

interface Props {
  stock: StockData;
  user: UserProfile;
  coherenceScore: number;
  onClose: () => void;
}

const StockModal: React.FC<Props> = ({ stock, user, coherenceScore, onClose }) => {
  // Estado para controlar qual tooltips está aberto (se for mobile)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Lógica de Cores e Mensagens baseada na Nota
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
      msg: "Este ativo tem pontos que divergem parcialmente dos seus valores ou objetivo."
    };
    return {
      bg: "bg-orange-50", text: "text-orange-900", border: "border-orange-100",
      icon: <AlertTriangle className="text-orange-600" size={24} />,
      title: "Baixa Coerência",
      msg: "Cuidado: Este ativo apresenta riscos ou práticas distantes do que você prioriza."
    };
  };

  const theme = getScoreTheme(coherenceScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
             {/* Tenta mostrar logo, fallback para texto */}
             <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                {/* Aqui verificamos se stock.logo existe na tipagem ou se vem do 'any' */}
                {(stock as any).logo ? (
                  <img src={(stock as any).logo} alt={stock.ticker} className="w-full h-full object-contain" />
                ) : (
                  <span className="font-bold text-gray-400 text-xs">{stock.ticker.substring(0,2)}</span>
                )}
             </div>
             <div>
               <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                 {stock.ticker}
                 {stock.esgScore >= 80 && <Leaf size={18} className="text-emerald-500" fill="currentColor"/>}
               </h2>
               <p className="text-sm text-gray-500">{stock.name}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* 1. SCORE CARD (DINÂMICO) */}
          <div className={`p-5 rounded-2xl border ${theme.bg} ${theme.border}`}>
            <div className="flex items-start gap-4">
               <div className="mt-1">{theme.icon}</div>
               <div>
                 <h3 className={`font-bold text-lg ${theme.text}`}>Coerência Livo: {coherenceScore}%</h3>
                 <p className={`text-sm ${theme.text} opacity-90 mt-1 leading-relaxed`}>
                   {theme.msg}
                 </p>
               </div>
            </div>
          </div>

          {/* 2. CERTIFICAÇÕES E SELOS (A "PROVA" DA NOTA) */}
          <div>
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Leaf size={18} className="text-emerald-600"/> Credenciais ESG
            </h4>
            
            {stock.tags && stock.tags.length > 0 ? (
              <div className="space-y-3">
                {stock.tags.map(tag => (
                  <div key={tag} className="group relative bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 hover:border-emerald-300 transition-colors cursor-help">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-emerald-800 text-sm flex items-center gap-2">
                        ✅ {tag}
                      </span>
                      <Info size={14} className="text-emerald-400" />
                    </div>
                    {/* Tooltip Explicação */}
                    <div className="hidden group-hover:block mt-2 text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-100 shadow-sm animate-in fade-in">
                      {CERTIFICATIONS_DICT[tag] || "Certificação reconhecida pelo mercado financeiro."}
                    </div>
                    {/* Versão Mobile (sem hover) */}
                    <p className="md:hidden mt-2 text-xs text-gray-500">
                      {CERTIFICATIONS_DICT[tag]}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-500 italic">
                Nenhuma certificação oficial B3 (ISE, Novo Mercado, ICO2) identificada para este ativo no momento.
              </div>
            )}
          </div>

          {/* 3. DADOS FINANCEIROS COM TOOLTIPS */}
          <div>
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Activity size={18} className="text-blue-600"/> Indicadores
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Preço", value: `R$ ${stock.price.toFixed(2)}`, icon: null },
                { label: "DY", value: `${stock.dividendYield}%`, help: "DY" },
                { label: "P/L", value: stock.peRatio, help: "P/L" },
                { label: "ROE", value: `${stock.roe}%`, help: "ROE" },
              ].map((item: any) => (
                <div key={item.label} className="bg-gray-50 p-3 rounded-xl border border-gray-100 relative group">
                  <p className="text-xs text-gray-500 font-bold uppercase flex items-center gap-1">
                    {item.label}
                    {item.help && (
                       <div className="relative">
                         <Info 
                           size={12} 
                           className="text-gray-400 cursor-pointer hover:text-blue-500"
                         />
                         {/* Tooltip Suspenso */}
                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                            {FINANCIAL_TERMS[item.help]}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                         </div>
                       </div>
                    )}
                  </p>
                  <p className="text-lg font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. AVISO DE RESPONSABILIDADE */}
          <div className="text-[10px] text-gray-400 text-center leading-tight">
             A Livo exibe dados públicos da B3. Rentabilidade passada não garante futuro. <br/>
             As notas ESG são baseadas em whitelists oficiais (ISE, ICO2).
          </div>

        </div>
      </div>
    </div>
  );
};

export default StockModal;
