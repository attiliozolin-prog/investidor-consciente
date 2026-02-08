import React from "react";
import { X, ShieldCheck, ExternalLink, Info, Link as LinkIcon, TrendingUp, AlertTriangle } from "lucide-react";

interface Props {
  onClose: () => void;
}

const MethodologyModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Entenda a Nota Livo</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 text-gray-700">
          
          {/* Intro */}
          <div className="space-y-3">
            <p className="leading-relaxed">
              A <strong>Nota Livo</strong> é um índice dinâmico (0 a 100) que mede a integridade e o compromisso ESG das empresas. Nosso algoritmo parte de uma base neutra e aplica <strong>bônus</strong> para boas práticas e <strong>penalidades</strong> para infrações graves.
            </p>
            <p className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-800 flex gap-2">
              <Info size={18} className="shrink-0 mt-0.5"/>
              <span>
                <strong>Entenda a Fórmula:</strong> Nota = Base (50) + Selos B3 (Bônus) - Infrações (Penalidades).
              </span>
            </p>
          </div>

          {/* TABELA DE CÁLCULO ATUALIZADA */}
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-4 py-3 font-bold w-20">Pontos</th>
                  <th className="px-4 py-3 font-bold w-24">Fator</th>
                  <th className="px-4 py-3 font-bold">Critério de Avaliação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                
                {/* BASE */}
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 font-bold text-gray-600">50</td>
                  <td className="px-4 py-3 font-bold text-gray-600">BASE</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    Toda empresa listada na B3 começa com nota neutra (50), assumindo conformidade legal básica (CVM).
                  </td>
                </tr>

                {/* BÔNUS (VERDE) */}
                <tr className="bg-white hover:bg-emerald-50/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-emerald-600">+35</td>
                  <td className="px-4 py-3 font-bold text-gray-900">ISE</td>
                  <td className="px-4 py-3 text-gray-600">
                    <strong>Sustentabilidade Empresarial.</strong> Índice mais rigoroso da B3. Avalia eficiência econômica e ambiental.
                  </td>
                </tr>
                <tr className="bg-white hover:bg-emerald-50/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-emerald-600">+15</td>
                  <td className="px-4 py-3 font-bold text-gray-900">ICO2</td>
                  <td className="px-4 py-3 text-gray-600">
                    <strong>Carbono Eficiente.</strong> Transparência e compromisso com redução de emissões (GEE).
                  </td>
                </tr>
                <tr className="bg-white hover:bg-emerald-50/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-emerald-600">+15</td>
                  <td className="px-4 py-3 font-bold text-gray-900">IDIVERSA</td>
                  <td className="px-4 py-3 text-gray-600">
                    <strong>Diversidade.</strong> Representatividade de gênero e raça na liderança e quadro geral.
                  </td>
                </tr>
                <tr className="bg-white hover:bg-emerald-50/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-emerald-600">+15</td>
                  <td className="px-4 py-3 font-bold text-gray-900">IGCT</td>
                  <td className="px-4 py-3 text-gray-600">
                    <strong>Governança Corporativa.</strong> Altos padrões de gestão, liquidez e transparência.
                  </td>
                </tr>
                <tr className="bg-white hover:bg-emerald-50/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-emerald-600">+10</td>
                  <td className="px-4 py-3 font-bold text-gray-900">IGPTW</td>
                  <td className="px-4 py-3 text-gray-600">
                    <strong>Ambiente de Trabalho.</strong> Certificação Great Place to Work (GPTW).
                  </td>
                </tr>

                {/* PENALIDADES (VERMELHO) */}
                <tr className="bg-red-50/50 hover:bg-red-50 transition-colors border-t-2 border-red-100">
                  <td className="px-4 py-3 font-bold text-red-600">-10 a -50</td>
                  <td className="px-4 py-3 font-bold text-red-800 flex items-center gap-1">
                    <AlertTriangle size={14}/> Ambiental
                  </td>
                  <td className="px-4 py-3 text-red-700 text-xs">
                    Infrações graves monitoradas pelo <strong>IBAMA</strong> (ex: desmatamento, vazamentos, desastres).
                  </td>
                </tr>
                <tr className="bg-red-50/50 hover:bg-red-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-red-600">-15 a -30</td>
                  <td className="px-4 py-3 font-bold text-red-800 flex items-center gap-1">
                    <AlertTriangle size={14}/> Econômico
                  </td>
                  <td className="px-4 py-3 text-red-700 text-xs">
                    Práticas anticompetitivas ou cartéis julgados pelo <strong>CADE</strong>.
                  </td>
                </tr>
                <tr className="bg-red-50/50 hover:bg-red-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-red-600">-20 a -80</td>
                  <td className="px-4 py-3 font-bold text-red-800 flex items-center gap-1">
                    <AlertTriangle size={14}/> Governança
                  </td>
                  <td className="px-4 py-3 text-red-700 text-xs">
                    Fraudes contábeis (CVM), corrupção ou recuperação judicial fraudulenta.
                  </td>
                </tr>
                <tr className="bg-red-100 hover:bg-red-200 transition-colors border-t border-red-200">
                  <td className="px-4 py-3 font-bold text-red-900">ZERO</td>
                  <td className="px-4 py-3 font-bold text-red-900">VETO</td>
                  <td className="px-4 py-3 text-red-900 text-xs font-bold">
                    Empresas na Lista Suja do Trabalho Escravo (MTE) recebem nota 0 imediata.
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          <p className="text-xs text-center text-gray-500 italic">
            * A nota final é limitada entre 0 (mínimo) e 100 (máximo).
          </p>

          {/* Links e Fontes */}
          <div className="border-t border-gray-100 pt-6 pb-2">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ExternalLink size={16} /> Fontes Oficiais Monitoradas
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              <a href="https://www.b3.com.br/pt_br/market-data-e-indices/indices/indices-de-sustentabilidade/" target="_blank" rel="noreferrer" 
                 className="flex items-center gap-2 text-gray-700 hover:text-emerald-700 bg-gray-50 hover:bg-emerald-50 p-3 rounded-lg border border-gray-100 hover:border-emerald-200 transition-all group sm:col-span-2">
                <LinkIcon size={14} className="text-gray-400 group-hover:text-emerald-500 shrink-0"/> 
                <span>Hub ESG da B3 <strong>(ISE, ICO2, IDIVERSA)</strong></span>
              </a>

              <a href="https://www.gov.br/ibama/pt-br" target="_blank" rel="noreferrer" 
                 className="flex items-center gap-2 text-gray-700 hover:text-red-700 bg-gray-50 hover:bg-red-50 p-3 rounded-lg border border-gray-100 hover:border-red-200 transition-all group">
                <LinkIcon size={14} className="text-gray-400 group-hover:text-red-500 shrink-0"/> 
                <span>IBAMA / MMA (Ambiental)</span>
              </a>

              <a href="https://www.gov.br/trabalho-e-emprego/pt-br" target="_blank" rel="noreferrer" 
                 className="flex items-center gap-2 text-gray-700 hover:text-red-700 bg-gray-50 hover:bg-red-50 p-3 rounded-lg border border-gray-100 hover:border-red-200 transition-all group">
                <LinkIcon size={14} className="text-gray-400 group-hover:text-red-500 shrink-0"/> 
                <span>MTE (Lista Suja)</span>
              </a>

            </div>
          </div>

          <div className="text-[10px] text-gray-400 text-center border-t border-gray-100 pt-4">
            A Nota Livo é uma ferramenta quantitativa baseada em dados públicos. Não constitui recomendação de investimento.
          </div>

        </div>
      </div>
    </div>
  );
};

export default MethodologyModal;
