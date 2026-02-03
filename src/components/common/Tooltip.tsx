import React, { useState } from "react";
import { Info } from "lucide-react";
import { GlossaryTerm } from "../../types";
import { GLOSSARY } from "../../data/glossary";

interface Props {
  term: string;
  label?: string;
  children?: React.ReactNode;
}

export default function Tooltip({ term, label, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const glossaryItem = GLOSSARY.find(
    (g) => g.term.includes(term) || g.term === term
  );

  const definition = glossaryItem
    ? glossaryItem.definition
    : "Termo financeiro.";

  return (
    <div className="relative inline-flex items-center gap-1 group">
      <span
        className="cursor-help border-b border-dotted border-gray-400"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children || label || term}
      </span>

      <Info size={14} className="text-gray-400" />

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs p-3 rounded-xl z-50">
          <p className="font-semibold mb-1">{term}</p>
          <p className="text-gray-300">{definition}</p>
        </div>
      )}
    </div>
  );
}
