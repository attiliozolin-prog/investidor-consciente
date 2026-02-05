import React from "react";
import { Leaf } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg tracking-tight">
        {/* Aqui idealmente entraria o SVG do Logo Livo, usaremos o Leaf provisoriamente */}
        <Leaf size={24} />
        <span className="text-xl">Livo</span>
      </div>

      <span className="text-xs text-gray-400 font-medium hidden md:block">
        Guia para investir com responsabilidade e consciência
      </span>
    </header>
  );
}
