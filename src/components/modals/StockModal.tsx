import React from "react";
import {
  X,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import MetricBox from "../common/MetricBox";
import { StockData, UserProfile } from "../../types";

interface Props {
  stock: StockData;
  user: UserProfile;
  coherenceScore: number;
  onClose: () => void;
}

const StockModal: React.FC<Props> = ({
  stock,
  user,
  coherenceScore,
  onClose,
}) => {
  const isFixedIncome = stock.assetType === "fixed_income";

  const radarData = [
    { subject: "Financeiro", A: stock.financialScore, fullMark: 100 },
    {
      subject: "ESG",
      A: stock.esgScore,
      fullMark: 100,
    },
    {
      subject: "Estabilidade",
      A:
        stock.volatility === "Baixa"
          ? 90
          : stock.volatility === "Média"
          ? 60
          : 30,
      fullMark: 100,
    },
  ];

  const isExpensive =
    !isFixedIncome && stock.peRatio > 30 && stock.assetType === "stock";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <div className="sticky top-0 bg-white/90 backdrop-blur z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {stock.ticker}
            </h2>
            <p className="text-sm text-gray-500">{stock.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
            <div className="flex gap-3">
              <CheckCircle2 className="text-emerald-600 mt-1" />
              <div>
                <h3 className="font-bold text-emerald-900">
                  Coerência com seu perfil: {coherenceScore}%
                </h3>
                <p className="text-sm text-emerald-800">
                  Alinhado ao seu objetivo{" "}
                  <strong>{user.goal}</strong>.
                </p>
              </div>
            </div>
          </div>

          {isExpensive && (
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 flex gap-3">
              <AlertTriangle className="text-yellow-600 mt-1" />
              <p className="text-sm text-yellow-700">
                P/L elevado ({stock.peRatio.toFixed(1)}). Avalie com cautela.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                {stock.description}
              </p>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="text-emerald-600" size={16} />
                  <span className="font-semibold text-sm">
                    Destaque ESG
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {stock.esgHighlight}
                </p>
              </div>

              {stock.riskReason && (
                <div className="mt-3 bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <p className="text-xs text-orange-700">
                    {stock.riskReason}
                  </p>
                </div>
              )}
            </div>

            <div className="h-64">
              {isFixedIncome ? (
                <div className="h-full flex flex-col items-center justify-center bg-blue-50 rounded-xl">
                  <ShieldCheck size={48} className="text-blue-500 mb-2" />
                  <p className="text-sm text-blue-700">
                    Ativo de baixo risco
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      dataKey="A"
                      stroke="#059669"
                      fill="#059669"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricBox label="Preço" value={`R$ ${stock.price}`} />
            <MetricBox label="DY" value={`${stock.dividendYield}%`} />
            <MetricBox label="P/L" value={stock.peRatio.toFixed(1)} />
            <MetricBox label="ROE" value={`${stock.roe}%`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockModal;
