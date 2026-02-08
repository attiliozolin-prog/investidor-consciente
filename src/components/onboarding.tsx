import React, { useState } from "react";
import { ArrowRight, TrendingUp, Shield } from "lucide-react"; 
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
    esgImportance: 1, // Padrão fixo (100% Nota Livo)
    riskProfile: null,
    isOnboardingComplete: false,
    experienceLevel: undefined,
  });

  const next = () => setStep((s) => s + 1);

  // Função para finalizar (Usada no Passo 4)
  const finish = (risk: RiskProfile) => {
    const finalProfile = { ...profile, riskProfile: risk, isOnboardingComplete: true };
    setProfile(finalProfile);
    onComplete(finalProfile);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-8">
        {/* PROGRESSO (Agora são 4 passos) */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? "bg-emerald-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* STEP 1 — MANIFESTO */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-center mb-4">
               <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 p-4 overflow-hidden">
                 <img 
                   src="/logo.png" 
                   alt="Livo Logo" 
                   className="w-full h-full object-contain"
                   onError={(e) => {
                     e.currentTarget.style.display = 'none';
                     e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>';
                   }}
                 />
               </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              Bem vindo(a) a Livo!
            </h1>

            <div className="space-y-4 text-gray-600 leading-relaxed text-center">
              <p>
               Um guia de bolso para investir com responsabilidade, consciência e tranquilidade.
              </p>
              <p>
                <strong>Não somos um banco nem uma corretora.</strong>
              </p>
              <p>
               Com a Livo, você aprende mais sobre investimentos, monta a sua carteira equilibrada e monitora onde seu dinheiro está aplicado.
              </p>
            </div>

            <button
              onClick={next}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all"
            >
              Começar minha jornada <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2 — EXPERIÊNCIA */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900">
              Qual é o seu momento?
            </h2>
            <p className="text-sm text-gray-500">Queremos adaptar nossa linguagem a você.</p>

            <button
              onClick={() => { setProfile({ ...profile, experienceLevel: "iniciante" }); next(); }}
              className="w-full p-5 rounded-2xl border hover:border-emerald-300 hover:bg-emerald-50 text-left transition-all group"
            >
              <div className="font-bold text-gray-900 group-hover:text-emerald-800">Estou começando agora</div>
              <div className="text-sm text-gray-500">Quero aprender sem "financês" e sem pressão.</div>
            </button>

            <button
              onClick={() => { setProfile({ ...profile, experienceLevel: "avancado" }); next(); }}
              className="w-full p-5 rounded-2xl border hover:border-emerald-300 hover:bg-emerald-50 text-left transition-all group"
            >
              <div className="font-bold text-gray-900 group-hover:text-emerald-800">Já invisto</div>
              <div className="text-sm text-gray-500">Busco alinhar minha carteira aos meus valores.</div>
            </button>
          </div>
        )}

        {/* STEP 3 — OBJETIVO */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900">
              O que você quer construir?
            </h2>
            <p className="text-sm text-gray-500">Seu dinheiro, alinhado à sua vida.</p>

            {Object.values(InvestmentGoal).map((goal) => (
              <button
                key={goal}
                onClick={() => { setProfile({ ...profile, goal }); next(); }}
                className="w-full p-5 rounded-2xl border hover:border-emerald-300 hover:bg-emerald-50 text-left transition-all"
              >
                {goal}
              </button>
            ))}
          </div>
        )}

        {/* STEP 4 — RISCO (AGORA FINALIZA O FLUXO) */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900">
              Como você prefere seguir?
            </h2>

            <button
              onClick={() => finish(RiskProfile.CONSERVATIVE)}
              className="w-full p-5 rounded-2xl border hover:border-blue-300 hover:bg-blue-50 flex gap-3 items-center"
            >
              <Shield className="text-blue-600" />
              <div>
                <div className="font-bold">Com calma e segurança</div>
                <div className="text-sm text-gray-500">Prefiro evitar sustos, mesmo rendendo menos.</div>
              </div>
            </button>

            <button
              onClick={() => finish(RiskProfile.MODERATE)}
              className="w-full p-5 rounded-2xl border hover:border-emerald-300 hover:bg-emerald-50 flex gap-3 items-center"
            >
              <TrendingUp className="text-emerald-600" />
              <div>
                <div className="font-bold">Com equilíbrio</div>
                <div className="text-sm text-gray-500">Busco crescimento moderado com riscos controlados.</div>
              </div>
            </button>

            <button
              onClick={() => finish(RiskProfile.BOLD)}
              className="w-full p-5 rounded-2xl border hover:border-orange-300 hover:bg-orange-50 flex gap-3 items-center"
            >
              <TrendingUp className="text-orange-600" />
              <div>
                <div className="font-bold">Com foco no longo prazo</div>
                <div className="text-sm text-gray-500">Aceito oscilações hoje para construir mais amanhã.</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
