import React, { useState, useEffect } from "react";
import { X, Calendar, DollarSign, Hash, Search, Loader2, AlertCircle } from "lucide-react";
import { Transaction } from "../../types";
import { MarketService } from "../../services/market";

interface AddTransactionModalProps {
  stocks: any[]; // Mantido para compatibilidade, mas vamos usar a API
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, "id">) => void;
  initialType?: "BUY" | "SELL";
}

export default function AddTransactionModal({
  onClose,
  onSave,
  initialType = "BUY",
}: AddTransactionModalProps) {
  const [type, setType] = useState<"BUY" | "SELL">(initialType);
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Estados para Busca Inteligente (API)
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedStockName, setSelectedStockName] = useState("");

  // Debounce da busca (para não chamar a API a cada letra)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        try {
          const results = await MarketService.searchStocks(searchTerm);
          setSearchResults(results);
          setShowResults(true);
        } catch (error) {
          console.error("Erro na busca:", error);
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
  }, [searchTerm]);

  const handleSelectStock = (stock: any) => {
    setTicker(stock.ticker);
    setPrice(stock.price.toFixed(2)); // Já preenche o preço atual!
    setSelectedStockName(stock.name);
    
    // Limpa a busca visualmente, mas mantém o selecionado
    setSearchTerm(stock.ticker); 
    setShowResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !quantity || !price || !date) return;

    onSave({
      ticker: ticker.toUpperCase(), // Garante ticker em caixa alta
      type,
      quantity: Number(quantity),
      price: Number(price),
      date,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Nova Transação</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Toggle Compra/Venda */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType("BUY")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                type === "BUY" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Compra
            </button>
            <button
              type="button"
              onClick={() => setType("SELL")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                type === "SELL" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Venda
            </button>
          </div>

          {/* BUSCA DE ATIVO (Conectada à Brapi) */}
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-gray-500 uppercase">Ativo (Ticker)</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {isSearching ? <Loader2 size={18} className="animate-spin"/> : <Search size={18} />}
              </div>
              <input
                type="text"
                placeholder="Busque ex: PETR4, WEGE3..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Se o usuário apagar, reseta o ticker selecionado
                  if(e.target.value === "") {
                    setTicker("");
                    setSelectedStockName("");
                  }
                }}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-bold text-gray-900 uppercase placeholder:normal-case placeholder:font-normal"
              />
            </div>

            {/* Dropdown de Resultados */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto z-20">
                {searchResults.map((stock) => (
                  <button
                    key={stock.ticker}
                    type="button"
                    onClick={() => handleSelectStock(stock)}
                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-gray-900">{stock.ticker}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{stock.name}</div>
                    </div>
                    <div className="text-sm font-bold text-emerald-600">
                      R$ {stock.price?.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {showResults && searchResults.length === 0 && searchTerm.length >= 3 && !isSearching && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-red-100 rounded-xl shadow-xl p-3 z-20 text-center">
                 <p className="text-xs text-red-500 flex items-center justify-center gap-1">
                   <AlertCircle size={12}/> Ativo não encontrado na B3.
                 </p>
              </div>
            )}

            {selectedStockName && (
              <p className="text-xs text-emerald-600 font-medium pl-1">
                Selecionado: {selectedStockName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantidade */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Quantidade</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-gray-900"
                />
              </div>
            </div>

            {/* Preço */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Preço (R$)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Data da Transação</label>
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

          {/* Botão Salvar */}
          <button
            type="submit"
            disabled={!ticker || !quantity || !price}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all mt-4 ${
              !ticker || !quantity || !price
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : type === "BUY"
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200"
            }`}
          >
            {type === "BUY" ? "Confirmar Compra" : "Confirmar Venda"}
          </button>
        </form>
      </div>
    </div>
  );
}
