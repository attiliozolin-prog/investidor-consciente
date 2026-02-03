import React from "react";
import { Leaf } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
        <Leaf size={20} />
        Investidor Consciente
      </div>

      <span className="text-xs text-gray-400">
        Guia de investimentos — não é um app bancário
      </span>
    </header>
  );
}
