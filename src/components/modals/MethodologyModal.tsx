import React from "react";
import { X, ShieldCheck, ExternalLink, Info, Link as LinkIcon } from "lucide-react";

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
              A <strong>Nota Livo</strong> é um indicador quantitativo que varia de <strong>0 a 100</strong>. Nosso objetivo é consolidar dados dispersos do mercado financeiro em uma métrica única, permitindo que você visualize rapidamente o nível de comprometimento público de uma empresa com práticas ESG.
            </p>
            <p className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-800 flex gap-2">
              <Info size={18} className="shrink-0 mt-0.5"/>
              <span>
                <strong>Como é calculado:</strong> Nosso algoritmo monitora as carteiras teóricas oficiais da <strong>B3</strong>. Se uma empresa cumpre os requisitos para entrar nesses índices, ela soma pontos.
              </span>
            </p>
          </div>

          {/* Tabela de Pontos (AJUSTADA PARA SOMA 100) */}
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-4 py-3 font-bold w-20">Pontos</th>
                  <th className="px-4 py-3 font-bold w-24">Índice</th>
                  <th className="px-4 py-3 font-bold">O que é avaliado?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-emerald-600">+35</td>
                  <td className="px-4 py-3 font-bold text-gray-900">ISE</td>
                  <td className="px-4 py-3 text-gray-600">
                    <strong>Sustentabilidade Empresarial.</strong> O índice mais abrangente. Avalia eficiência econômica, equilíbrio ambiental e justiça social.
                  </td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-emerald-600">+15</td>
                  <td className="px-4 py-3 font-bold text-gray-900">ICO2</td>
                  <td className="px-4 py-3 text-gray-600">
                    <strong>Eficiência de Carbono.</strong> Empresas transparentes sobre suas emissões de gases de efeito estufa (GEE).
                  </td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-emerald-600">+15</td>
                  <td className="px-4 py-3 font-bold text-gray-900">IDIVERSA</td>
                  <td className="px-4 py-3 text-gray-600">
                    <strong>Diversidade.</strong> Representatividade de gênero e raça no quadro de colaboradores e liderança.
                  </td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-emerald-600">+15</td>
                  <td className="px-4 py-3 font-bold text-gray-900">IGCT</td>
                  <td className="px-4 py-3 text-gray-600">
                    <strong>Governança Corporativa.</strong> Padrões elevados de governança, liquidez e transparência na gestão.
                  </td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-emerald-600">+10</td>
                  <td className="px-4 py-3 font-bold text-gray-900">IGPTW</td>
                  <td className="px-4 py-3 text-gray-600">
                    <strong>Ambiente de Trabalho.</strong> Certificadas como excelentes lugares para trabalhar (clima e relações).
                  </td>
                </tr>
                 <tr className="bg-gray-50">
                  <td className="px-4 py-3 font-bold text-gray-500">+10</td> {/* AJUSTADO PARA +10 */}
                  <td className="px-4 py-3 font-bold text-gray-500">BASE</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    Nota inicial para toda empresa listada na B3 (auditada, pública e regulada pela CVM).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-center text-gray-500 italic">
            <strong>Nota 100:</strong> Atingida quando a empresa participa de todos os índices monitorados acima (10 + 90 = 100).
          </p>

          {/* Links e Fontes (LINKS SEGUROS PARA HUBs) */}
          <div className="border-t border-gray-100 pt-6 pb-2">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ExternalLink size={16} /> Fontes Oficiais (Portal B3)
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* HUB SUSTENTABILIDADE (ISE, ICO2, IDIVERSA, IGPTW) */}
              <a href="https://www.b3.com.br/pt_br/market-data-e-indices/indices/indices-de-sustentabilidade/" target="_blank" rel="noreferrer" 
                 className="flex items-center gap-2 text-gray-700 hover:text-emerald-700 bg-gray-50 hover:bg-emerald-50 p-3 rounded-lg border border-gray-100 hover:border-emerald-200 transition-all group sm:col-span-2">
                <LinkIcon size={14} className="text-gray-400 group-hover:text-emerald-500 shrink-0"/> 
                <span>Hub de Índices ESG <strong>(ISE, ICO2, IDIVERSA, IGPTW)</strong></span>
              </a>

              {/* HUB GOVERNANÇA (IGCT) */}
              <a href="https://www.b3.com.br/pt_br/market-data-e-indices/indices/indices-de-governanca/" target="_blank" rel="noreferrer" 
                 className="flex items-center gap-2 text-gray-700 hover:text-emerald-700 bg-gray-50 hover:bg-emerald-50 p-3 rounded-lg border border-gray-100 hover:border-emerald-200 transition-all group sm:col-span-2">
                <LinkIcon size={14} className="text-gray-400 group-hover:text-emerald-500 shrink-0"/> 
                <span>Hub de Governança <strong>(IGCT, Novo Mercado)</strong></span>
              </a>

            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic">
              * Redireciona para a página oficial da B3 onde constam as carteiras vigentes.
            </p>
          </div>

          <div className="text-[10px] text-gray-400 text-center border-t border-gray-100 pt-4">
            A Nota Livo é uma ferramenta de auxílio baseada em critérios técnicos públicos. Não constitui recomendação de compra ou venda.
          </div>

        </div>
      </div>
    </div>
  );
};

export default MethodologyModal;
