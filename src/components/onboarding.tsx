import React, { useState } from "react";
import { ArrowRight, Leaf, TrendingUp, Shield, Coins } from "lucide-react"; 
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

  // TEXTOS ATUALIZADOS PARA O SLIDER
  const getEsgLabel = (value: number) => {
    if (value <= 0.2) return "Foco total em Lucro";
    if (value <= 0.4) return "Prefiro maior Rentabilidade";
    if (value <= 0.6) return "Busco equilíbrio (Lucro + Impacto)";
    if (value <= 0.8) return "Prefiro empresas Sustentáveis";
    return "Foco total em Impacto ESG";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-8">
        {/* PROGRESSO */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? "bg-emerald-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* STEP 1 — MANIFESTO LIVO (TEXTO NOVO) */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-center mb-4">
               {/* LOGO DA LIVO */}
               <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 p-4 overflow-hidden">
                 <img 
                   src="/logo.png" 
                   alt="Livo Logo" 
                   className="w-full h-full object-contain"
                   onError={(e) => {
                     e.currentTarget.style.display = 'none';
                     e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#236C3F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>';
                   }}
                 />
               </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              Bem vindo(a) a Livo
            </h1>

            <div className="space-y-4 text-gray-600 leading-relaxed text-center">
              <p>
               Descubra a nota real da sua carteira e invista com mais inteligência.
              </p>
              <p className="text-sm">
                A <strong>Livo</strong> analisa seus investimentos e calcula uma nota exclusiva baseada no que é importante para você: Lucro, Segurança ou Sustentabilidade.
              </p>
            </div>

            <button
              onClick={next}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200"
            >
              Descobrir minha nota <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2 — EXPERIÊNCIA */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900">
              Qual é o seu momento?
            </h2>

            <p className="text-sm text-gray-500">
              Queremos adaptar nossa linguagem a você.
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

        {/* STEP 3 — OBJETIVO */}
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

        {/* STEP 4 — RISCO */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900">
              Como você prefere seguir em sua jornada?
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

        {/* STEP 5 — VALORES (VISUAL MELHORADO) */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900">
              O que compõe uma Nota 100 pra você?
            </h2>

            <p className="text-sm text-gray-600">
              Defina o peso do <strong>Lucro</strong> vs <strong>Impacto</strong> na nota da sua carteira.
            </p>

            <div className="bg-white p-6 rounded-2xl space-y-6 border border-gray-200 shadow-sm">
              {/* Labels com Ícones */}
              <div className="flex justify-between items-end">
                <div className="flex flex-col items-start gap-1">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                     <Coins size={20} />
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Foco em<br/>Retorno</span>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                     <Leaf size={20} />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 text-right uppercase tracking-wide">Foco em<br/>Impacto</span>
                </div>
              </div>

              {/* Slider */}
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

              {/* Feedback de Texto */}
              <div className="text-center">
                 <span className="inline-block px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs font-bold text-gray-700">
                    {getEsgLabel(profile.esgImportance)}
                 </span>
              </div>
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
              Criar minha carteira <Leaf size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
