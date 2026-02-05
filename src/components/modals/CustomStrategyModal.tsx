import React, { useState, useEffect } from "react";
import { X, Save, AlertTriangle, PieChart } from "lucide-react";

interface Props {
  currentTargets: { fixed_income: number; fii: number; stock: number };
  onClose: () => void;
  onSave: (targets: { fixed_income: number; fii: number; stock: number }) => void;
}

const CustomStrategyModal: React.FC<Props> = ({ currentTargets, onClose, onSave }) => {
  // Estado local para edição (valores de 0 a 100)
  const [targets, setTargets] = useState(currentTargets);

  // Calcula o total para validar
  const total = targets.fixed_income + targets.fii + targets.stock;
  const isValid = total === 100;

  const handleChange = (key: keyof typeof targets, value: string) => {
    const num = Number(value);
    setTargets((prev) => ({ ...prev, [key]: num }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
               <PieChart size={20} />
            </div>
            <h2 className="font-bold text-gray-900">Estratégia Personalizada</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8 overflow-y-auto">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 leading-relaxed">
            Aqui você define as regras. Ajuste as porcentagens ideais para cada classe. 
            A soma deve ser exatamente <strong>100%</strong>.
          </div>

          <div className="space-y-6">
            {/* Renda Fixa */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-bold text-gray-700 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span> Renda Fixa
                </label>
                <span className="font-bold text-blue-600">{targets.fixed_income}%</span>
              </div>
              <input
                type="range" min="0" max="100" step="5"
                value={targets.fixed_income}
                onChange={(e) => handleChange("fixed_income", e.target.value)}
                className="w-full accent-blue-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* FIIs */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-bold text-gray-700 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500"></span> Fundos Imobiliários
                </label>
                <span className="font-bold text-orange-600">{targets.fii}%</span>
              </div>
              <input
                type="range" min="0" max="100" step="5"
                value={targets.fii}
                onChange={(e) => handleChange("fii", e.target.value)}
                className="w-full accent-orange-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Ações */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-bold text-gray-700 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Ações
                </label>
                <span className="font-bold text-emerald-600">{targets.stock}%</span>
              </div>
              <input
                type="range" min="0" max="100" step="5"
                value={targets.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                className="w-full accent-emerald-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Totalizador */}
          <div className={`flex items-center justify-between p-4 rounded-xl border ${isValid ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'}`}>
            <span className="font-bold text-gray-600">Total Alocado:</span>
            <span className={`text-xl font-black ${isValid ? 'text-emerald-600' : 'text-red-600'}`}>
              {total}%
            </span>
          </div>
          {!isValid && (
            <p className="text-xs text-red-500 font-bold flex items-center gap-1 justify-center">
              <AlertTriangle size={12} /> A soma precisa ser 100% para salvar.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => isValid && onSave(targets)}
            disabled={!isValid}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all shadow-lg ${
              isValid 
                ? 'bg-gray-900 hover:bg-black shadow-gray-300 cursor-pointer' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <Save size={18} /> Salvar Perfil Personalizado
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomStrategyModal;
