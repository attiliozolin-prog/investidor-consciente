import React, { useEffect, useState } from "react";
import { X, Hash, DollarSign, Calendar } from "lucide-react";
import { StockData } from "../../types";
import { Transaction } from "../../../domain/portfolio/types";

interface Props {
  stocks: StockData[];
  onClose: () => void;
  onSave: (t: Omit<Transaction, "id">) => void;
}

const AddTransactionModal: React.FC<Props> = ({
  stocks,
  onClose,
  onSave,
}) => {
  const [ticker, setTicker] = useState(stocks[0]?.ticker || "");
  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const selectedAsset = stocks.find((s) => s.ticker === ticker);
  const isFixedIncome = selectedAsset?.assetType === "fixed_income";

  useEffect(() => {
    if (selectedAsset && !price && !isFixedIncome) {
      setPrice(selectedAsset.price.toFixed(2));
    }
    if (isFixedIncome) setQuantity("1");
  }, [ticker, isFixedIncome, selectedAsset, price]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !ticker) return;

    const finalQty = isFixedIncome ? 1 : Number(quantity);
    if (!finalQty) return;

    onSave({
      ticker,
      type,
      quantity: finalQty,
      price: Number(price),
      date,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-900">Nova Movimentação</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType("BUY")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                type === "BUY"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Compra
            </button>
            <button
              type="button"
              onClick={() => setType("SELL")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                type === "SELL"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Venda
            </button>
          </div>

          <select
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="w-full p-3 border rounded-xl"
          >
            {stocks.map((s) => (
              <option key={s.ticker} value={s.ticker}>
                {s.ticker} — {s.name}
              </option>
            ))}
          </select>

          {!isFixedIncome && (
            <div className="relative">
              <Hash
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Quantidade"
                className="w-full pl-9 p-3 border rounded-xl"
                required
              />
            </div>
          )}

          <div className="relative">
            <DollarSign
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Valor"
              className="w-full pl-9 p-3 border rounded-xl"
              required
            />
          </div>

          <div className="relative">
            <Calendar
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-9 p-3 border rounded-xl"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl"
          >
            Confirmar
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
