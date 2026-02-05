import React, { useState } from "react";
import { ArrowRight, Leaf, TrendingUp, Shield, Heart } from "lucide-react"; // Adicionei Heart para 'Vida'
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

        {/* STEP 1 — MANIFESTO LIVO */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-center mb-4">
               <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                 <Leaf size={32} />
               </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              Olá, somos a Livo.
            </h1>

            <div className="space-y-4 text-gray-600 leading-relaxed text-center">
              <p>
                Acreditamos que o dinheiro deve servir à vida, e não o contrário.
              </p>
              <p>
                <strong>Não somos um banco nem uma corretora.</strong>
              </p>
              <p>
                Somos seu guia de bolso para investir com calma, responsabilidade e consciência.
              </p>
            </div>

            <button
              onClick={next}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              Começar minha jornada <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2 — EXPERIÊNCIA (Tom de Voz: Acolhedor) */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900">
              Qual é o seu momento?
            </h2>

            <p className="text-sm text-gray-500">
              Não existe resposta errada. Queremos apenas adaptar nossa linguagem a você.
            </p>

            <button
              onClick={() => {
                setProfile({ ...profile, experienceLevel: "iniciante" });
                next();
              }}
              className="w-full p-5 rounded-2xl border hover:border-emerald-300 hover:bg-emerald-50 text-left transition-all group"
            >
              <div className="font-bold text-gray-900 group-hover:text-emerald-800">Estou começando agora</div>
              <div className="text-sm text-gray-500">
                Quero aprender sem "financês" e sem pressão.
              </div>
            </button>

            <button
              onClick={() => {
                setProfile({ ...profile, experienceLevel: "avancado" });
                next();
              }}
              className="w-full p-5 rounded-2xl border hover:border-emerald-300 hover:bg-emerald-50 text-left transition-all group"
            >
              <div className="font-bold text-gray-900 group-hover:text-emerald-800">Já invisto</div>
              <div className="text-sm text-gray-500">
                Busco alinhar minha carteira aos meus valores.
              </div>
            </button>
          </div>
        )}

        {/* STEP 3 — OBJETIVO (Foco na Vida) */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900">
              O que você quer construir?
            </h2>

            <p className="text-sm text-gray-500">
              Seu dinheiro, alinhado à sua vida.
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

        {/* STEP 4 — RISCO (Tranquilidade) */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900">
              Como você prefere caminhar?
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
                <div className="font-bold">Com calma e segurança</div>
                <div className="text-sm text-gray-500">
                  Prefiro evitar sustos, mesmo rendendo menos.
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
                <div className="font-bold">Com equilíbrio</div>
                <div className="text-sm text-gray-500">
                  Busco crescimento moderado com riscos controlados.
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
                <div className="font-bold">Com foco no longo prazo</div>
                <div className="text-sm text-gray-500">
                  Aceito oscilações hoje para construir mais amanhã.
                </div>
              </div>
            </button>
          </div>
        )}

        {/* STEP 5 — VALORES (Essência Livo) */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900">
              Investir também é uma escolha ética
            </h2>

            <p className="text-sm text-gray-600">
              Na Livo, o impacto ambiental e social das empresas importa tanto quanto o lucro. Quanto isso pesa para você?
            </p>

            <div className="bg-gray-50 p-6 rounded-2xl space-y-4 border border-gray-100">
              <div className="flex justify-between text-sm font-semibold text-gray-500">
                <span>Foco em Retorno</span>
                <span>Foco em Impacto</span>
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
                className="w-full accent-emerald-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <button
              onClick={() =>
                onComplete({
                  ...profile,
                  isOnboardingComplete: true,
                })
              }
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all"
            >
              Entrar na Livo <Leaf size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
