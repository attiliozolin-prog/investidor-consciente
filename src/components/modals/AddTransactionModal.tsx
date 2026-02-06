import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, DollarSign, Hash, Search, Loader2, TrendingUp, Landmark, AlertCircle } from "lucide-react";
import { Transaction } from "../../types";
import { MarketService } from "../../services/market";

interface AddTransactionModalProps {
  stocks: any[];
  onClose: () => void;
  // MUDANÇA: Agora aceitamos um terceiro argumento opcional (dados completos da stock)
  onSave: (transaction: Omit<Transaction, "id">, stockData?: any) => void;
  initialType?: "BUY" | "SELL";
}

export default function AddTransactionModal({
  onClose,
  onSave,
  initialType = "BUY",
}: AddTransactionModalProps) {
  const [assetCategory, setAssetCategory] = useState<"VARIABLE" | "FIXED">("VARIABLE");
  const [type, setType] = useState<"BUY" | "SELL">(initialType);
  
  // Inputs
  const [ticker, setTicker] = useState(""); // Nome oficial (ex: PETR4)
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Busca Inteligente
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Armazena o objeto completo da ação selecionada para passar ao App
  const [selectedStockData, setSelectedStockData] = useState<any>(null);

  // Referência para focar no próximo input
  const quantityInputRef = useRef<HTMLInputElement>(null);

  // Debounce da Busca
  useEffect(() => {
    if (assetCategory === "FIXED") return;

    const delayDebounce = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        try {
          // Limpa caracteres especiais e busca
          const cleanTerm = searchTerm.trim();
          const results = await MarketService.searchStocks(cleanTerm);
          setSearchResults(results);
          setShowResults(true);
        } catch (error) {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, assetCategory]);

  const handleSelectStock = (stock: any) => {
    // 1. Preenche os dados
    setTicker(stock.ticker);
    setPrice(stock.price ? stock.price.toFixed(2) : "0.00");
    setSearchTerm(stock.ticker); // Mostra o ticker no input
    setSelectedStockData(stock); // Guarda os dados para salvar depois

    // 2. UX Mobile: Fecha a lista e foca na quantidade
    setShowResults(false);
    if (quantityInputRef.current) {
      quantityInputRef.current.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !date) return;

    // Garante números válidos
    const numQty = assetCategory === "VARIABLE" ? Number(quantity) : 1;
    const numPrice = Number(price);

    if (isNaN(numQty) || isNaN(numPrice) || numQty <= 0) {
      alert("Por favor, preencha valores válidos.");
      return;
    }

    if (assetCategory === "VARIABLE") {
      if (!ticker) return;
      onSave({
        ticker: ticker.toUpperCase(),
        type,
        quantity: numQty,
        price: numPrice,
        date,
      }, selectedStockData); // Envia dados extras (preço atual, setor, etc)
    } else {
      // Renda Fixa
      if (!searchTerm) return;
      onSave({
        ticker: searchTerm.toUpperCase(), // Usa o nome digitado como ticker
        type,
        quantity: 1,
        price: numPrice, // Valor total investido
        date,
        assetType: 'fixed_income' // Força o tipo
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      {/* Container Principal: Altura ajustada para mobile (não cobre teclado) */}
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Fixo */}
        <div className="bg-gray-50 border-b border-gray-100 flex-shrink-0">
          <div className="flex justify-between items-center px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">Adicionar Transação</h2>
            <button onClick={onClose} type="button" className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex px-6 pb-4 gap-2">
            <button
              type="button"
              onClick={() => { setAssetCategory("VARIABLE"); setTicker(""); setSearchTerm(""); }}
              className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                assetCategory === "VARIABLE" 
                  ? "bg-white border-emerald-500 text-emerald-700 shadow-sm" 
                  : "bg-transparent border-transparent text-gray-500 hover:bg-gray-100"
              }`}
            >
              <TrendingUp size={16} /> Ações / FIIs
            </button>
            <button
              type="button"
              onClick={() => { setAssetCategory("FIXED"); setTicker("FIXED"); setSearchTerm(""); }}
              className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                assetCategory === "FIXED" 
                  ? "bg-white border-blue-500 text-blue-700 shadow-sm" 
                  : "bg-transparent border-transparent text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Landmark size={16} /> Renda Fixa
            </button>
          </div>
        </div>

        {/* Corpo com Scroll (Para o teclado não esconder campos) */}
        <div className="overflow-y-auto p-6 space-y-5">
          
          {/* Toggle Compra/Venda */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType("BUY")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                type === "BUY" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {assetCategory === "VARIABLE" ? "Compra" : "Aplicação"}
            </button>
            <button
              type="button"
              onClick={() => setType("SELL")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                type === "SELL" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {assetCategory === "VARIABLE" ? "Venda" : "Resgate"}
            </button>
          </div>

          {/* CAMPO DE BUSCA (Crítico) */}
          <div className="space-y-1 relative z-20">
            <label className="text-xs font-bold text-gray-500 uppercase">
              {assetCategory === "VARIABLE" ? "Ativo (Ticker)" : "Nome do Título"}
            </label>
            
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {isSearching ? <Loader2 size={18} className="animate-spin"/> : <Search size={18} />}
              </div>
              <input
                type="text"
                placeholder={assetCategory === "VARIABLE" ? "Ex: PETR4..." : "Ex: CDB Nubank..."}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (assetCategory === "VARIABLE" && e.target.value === "") {
                    setTicker("");
                  }
                  if (assetCategory === "FIXED") {
                    setTicker(e.target.value); // Na renda fixa, o ticker é o nome
                  }
                }}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-gray-900 uppercase placeholder:normal-case"
              />
            </div>

            {/* LISTA DE RESULTADOS (CORRIGIDA PARA MOBILE) */}
            {assetCategory === "VARIABLE" && showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50 ring-1 ring-black/5">
                {searchResults.map((stock) => (
                  <button
                    key={stock.ticker}
                    type="button"
                    // MUDANÇA IMPORTANTE: onMouseDown dispara antes do onBlur do input
                    onMouseDown={(e) => {
                      e.preventDefault(); // Impede que o input perca foco antes da ação
                      handleSelectStock(stock);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-gray-900">{stock.ticker}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[180px]">{stock.name}</div>
                    </div>
                    <div className="text-sm font-bold text-emerald-600">
                      R$ {stock.price?.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Aviso de erro */}
            {assetCategory === "VARIABLE" && searchTerm.length >= 3 && !isSearching && searchResults.length === 0 && showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-red-100 rounded-xl p-3 z-20 text-center shadow-lg">
                 <p className="text-xs text-red-500 flex items-center justify-center gap-1">
                   <AlertCircle size={12}/> Ativo não encontrado na B3.
                 </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* QUANTIDADE */}
            {assetCategory === "VARIABLE" ? (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Quantidade</label>
                <div className="relative">
                  <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={quantityInputRef}
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-gray-900"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1 opacity-50 pointer-events-none">
                 <label className="text-xs font-bold text-gray-500 uppercase">Quantidade</label>
                 <div className="relative">
                    <input disabled type="text" value="1" className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-center text-gray-500"/>
                 </div>
              </div>
            )}

            {/* PREÇO */}
            <div className={`space-y-1 ${assetCategory === "FIXED" ? "col-span-2 md:col-span-1" : ""}`}>
              <label className="text-xs font-bold text-gray-500 uppercase">
                {assetCategory === "VARIABLE" ? "Preço Unit. (R$)" : "Valor Total (R$)"}
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* DATA */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Data</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-gray-700 font-medium"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!searchTerm || !price || (assetCategory === "VARIABLE" && !quantity)}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all mt-4 ${
              !searchTerm || !price
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : type === "BUY"
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200"
            }`}
          >
            {type === "BUY" ? "Confirmar" : "Confirmar Venda"}
          </button>
          
          {/* Espaço extra para scroll no mobile */}
          <div className="h-4 sm:hidden"></div>
        </div>
      </div>
    </div>
  );
}
