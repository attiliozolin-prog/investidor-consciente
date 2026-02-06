import React, { useState, useEffect } from "react";
import { X, Calendar, DollarSign, Hash, Search, Loader2, AlertCircle, TrendingUp, Landmark } from "lucide-react";
import { Transaction } from "../../types";
import { MarketService } from "../../services/market";

interface AddTransactionModalProps {
  stocks: any[];
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, "id">) => void;
  initialType?: "BUY" | "SELL";
}

export default function AddTransactionModal({
  onClose,
  onSave,
  initialType = "BUY",
}: AddTransactionModalProps) {
  // ABAS: 'VARIABLE' (Ações/FIIs) ou 'FIXED' (Renda Fixa)
  const [assetCategory, setAssetCategory] = useState<"VARIABLE" | "FIXED">("VARIABLE");
  
  const [type, setType] = useState<"BUY" | "SELL">(initialType);
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(""); // Usado como Preço Unitário (Variável) ou Valor Total (Fixa)
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Estados para Busca Inteligente (Renda Variável)
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedStockName, setSelectedStockName] = useState("");

  // Debounce da busca
  useEffect(() => {
    if (assetCategory === "FIXED") return; // Não busca se for renda fixa

    const delayDebounce = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        try {
          const results = await MarketService.searchStocks(searchTerm);
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
    setTicker(stock.ticker);
    setPrice(stock.price.toFixed(2));
    setSelectedStockName(stock.name);
    setSearchTerm(stock.ticker); 
    setShowResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !date) return;

    if (assetCategory === "VARIABLE") {
      // Renda Variável: Validação normal
      if (!ticker || !quantity) return;
      onSave({
        ticker: ticker.toUpperCase(),
        type,
        quantity: Number(quantity),
        price: Number(price),
        date,
      });
    } else {
      // Renda Fixa: Adaptação Lógica
      // Ticker vira o Nome (ex: "CDB NUBANK")
      // Quantidade fixa em 1
      // Preço vira o Valor Total Investido
      if (!searchTerm) return; // Aqui searchTerm é usado como o Nome do Ativo
      onSave({
        ticker: searchTerm.toUpperCase(), // Salva o nome como ticker para exibição
        type,
        quantity: 1, // Hack lógico: 1 unidade de "R$ 1000"
        price: Number(price), // Valor total
        date,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        
        {/* Header com Abas de Categoria */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="flex justify-between items-center px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">Adicionar Ativo</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
              <X size={20} />
            </button>
          </div>
          
          {/* Seletor de Categoria */}
          <div className="flex px-6 pb-4 gap-2">
            <button
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Toggle Compra/Venda (Muda texto dependendo da categoria) */}
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

          {/* CAMPO 1: BUSCA (Variável) ou NOME (Fixa) */}
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-gray-500 uppercase">
              {assetCategory === "VARIABLE" ? "Ativo (Ticker)" : "Nome do Título"}
            </label>
            
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {isSearching ? <Loader2 size={18} className="animate-spin"/> : <Search size={18} />}
              </div>
              <input
                type="text"
                placeholder={assetCategory === "VARIABLE" ? "Ex: WEGE3, PETR4..." : "Ex: CDB Nubank, Tesouro Selic..."}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (assetCategory === "VARIABLE" && e.target.value === "") {
                    setTicker("");
                    setSelectedStockName("");
                  }
                }}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-400"
              />
            </div>

            {/* Dropdown de Resultados (Apenas para Variável) */}
            {assetCategory === "VARIABLE" && showResults && searchResults.length > 0 && (
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
            
            {assetCategory === "VARIABLE" && selectedStockName && (
              <p className="text-xs text-emerald-600 font-medium pl-1">
                Selecionado: {selectedStockName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* CAMPO 2: QUANTIDADE (Apenas Variável) ou OCULTO (Fixa) */}
            {assetCategory === "VARIABLE" ? (
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
            ) : (
              <div className="space-y-1 opacity-50 pointer-events-none">
                 <label className="text-xs font-bold text-gray-500 uppercase">Quantidade</label>
                 <div className="relative">
                    <input type="text" value="1" disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-500 text-center"/>
                 </div>
              </div>
            )}

            {/* CAMPO 3: PREÇO (Variável) ou VALOR TOTAL (Fixa) */}
            <div className={`space-y-1 ${assetCategory === "FIXED" ? "col-span-2 md:col-span-1" : ""}`}>
              <label className="text-xs font-bold text-gray-500 uppercase">
                {assetCategory === "VARIABLE" ? "Preço Unitário (R$)" : "Valor Total (R$)"}
              </label>
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
            disabled={!searchTerm || !price || (assetCategory === "VARIABLE" && !quantity)}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all mt-4 ${
              !searchTerm || !price
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : type === "BUY"
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200"
            }`}
          >
            {type === "BUY" ? "Confirmar" : "Confirmar"}
          </button>
        </form>
      </div>
    </div>
  );
}
