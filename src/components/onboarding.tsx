import React, { useState } from "react";
import { ArrowRight, Leaf, TrendingUp, Shield } from "lucide-react";
import {
  InvestmentGoal,
  RiskProfile,
  UserProfile,
} from "../types";

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(1);

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    goal: null,
    esgImportance: 0.5,
    riskProfile: null,
    isOnboardingComplete: false,
    experienceLevel: undefined,
  });

  const next = () => setStep((s) => s + 1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-8">
        {/* PROGRESSO */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? "bg-emerald-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* STEP 1 — BOAS-VINDAS */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h1 className="text-3xl font-bold text-gray-900">
              Bem-vindo ao Investidor Consciente
            </h1>

            <p className="text-gray-600 leading-relaxed">
              Este <strong>não é</strong> um aplicativo para comprar ou vender investimentos.
              <br />
              Aqui você <strong>organiza sua carteira</strong>, entende riscos e recebe
              <strong> orientações inteligentes</strong>.
            </p>

            <p className="text-sm text-gray-500">
              Pense nele como um <strong>consultor de bolso</strong>, sempre disponível
              para te ajudar a tomar decisões melhores.
            </p>

            <button
              onClick={next}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
            >
              Começar <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2 — EXPERIÊNCIA */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900">
              Qual é a sua experiência com investimentos?
            </h2>

            <p className="text-sm text-gray-500">
              Isso ajusta a linguagem, os alertas e os insights do app.
            </p>

            <button
              onClick={() => {
                setProfile({ ...profile, experienceLevel: "iniciante" });
                next();
              }}
              className="w-full p-5 rounded-2xl border hover:border-emerald-300 hover:bg-emerald-50 text-left transition-all"
            >
              <div className="font-bold">Sou iniciante</div>
              <div className="text-sm text-gray-500">
                Nunca investi ou estou começando agora
              </div>
            </button>

            <button
              onClick={() => {
                setProfile({ ...profile, experienceLevel: "avancado" });
                next();
              }}
              className="w-full p-5 rounded-2xl border hover:border-emerald-300 hover:bg-emerald-50 text-left transition-all"
            >
              <div className="font-bold">Já tenho experiência</div>
              <div className="text-sm text-gray-500">
                Quero monitorar, rebalancear e receber análises
              </div>
            </button>
          </div>
        )}

        {/* STEP 3 — OBJETIVO */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900">
              Qual é o seu principal objetivo?
            </h2>

            <p className="text-sm text-gray-500">
              Isso pode ser alterado depois.
            </p>

            {Object.values(InvestmentGoal).map((goal) => (
              <button
                key={goal}
                onClick={() => {
                  setProfile({ ...profile, goal });
                  next();
                }}
                className="w-full p-5 rounded-2xl border hover:border-emerald-300 hover:bg-emerald-50 text-left transition-all"
              >
                {goal}
              </button>
            ))}
          </div>
        )}

        {/* STEP 4 — RISCO */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900">
              Como você se sente em relação a riscos?
            </h2>

            <button
              onClick={() => {
                setProfile({ ...profile, riskProfile: RiskProfile.CONSERVATIVE });
                next();
              }}
              className="w-full p-5 rounded-2xl border hover:border-blue-300 hover:bg-blue-50 flex gap-3 items-center"
            >
              <Shield className="text-blue-600" />
              <div>
                <div className="font-bold">Prefiro segurança</div>
                <div className="text-sm text-gray-500">
                  Menos oscilações
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setProfile({ ...profile, riskProfile: RiskProfile.MODERATE });
                next();
              }}
              className="w-full p-5 rounded-2xl border hover:border-emerald-300 hover:bg-emerald-50 flex gap-3 items-center"
            >
              <TrendingUp className="text-emerald-600" />
              <div>
                <div className="font-bold">Equilíbrio</div>
                <div className="text-sm text-gray-500">
                  Risco controlado
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setProfile({ ...profile, riskProfile: RiskProfile.BOLD });
                next();
              }}
              className="w-full p-5 rounded-2xl border hover:border-orange-300 hover:bg-orange-50 flex gap-3 items-center"
            >
              <TrendingUp className="text-orange-600" />
              <div>
                <div className="font-bold">Busco mais retorno</div>
                <div className="text-sm text-gray-500">
                  Aceito oscilações
                </div>
              </div>
            </button>
          </div>
        )}

        {/* STEP 5 — CONSCIÊNCIA */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900">
              Além do retorno financeiro
            </h2>

            <p className="text-sm text-gray-600">
              Você também pode considerar o impacto ambiental, social e ético
              das empresas — no seu ritmo.
            </p>

            <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between text-sm font-semibold text-gray-500">
                <span>Retorno</span>
                <span>Impacto</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={profile.esgImportance}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    esgImportance: Number(e.target.value),
                  })
                }
                className="w-full accent-emerald-600"
              />
            </div>

            <button
              onClick={() =>
                onComplete({
                  ...profile,
                  isOnboardingComplete: true,
                })
              }
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
            >
              Finalizar <Leaf size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
