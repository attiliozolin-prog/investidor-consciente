import React from "react";
import { ArrowDownLeft, ArrowUpRight, Trash2, X } from "lucide-react";
import { Transaction, StockData } from "../../types";

interface Props {
  transactions: Transaction[];
  onClose: () => void;
  onDelete: (id: string) => void;
}

const TransactionHistoryModal: React.FC<Props> = ({
  transactions,
  onClose,
  onDelete,
}) => {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-900">Histórico</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sortedTransactions.length === 0 ? (
            <p className="text-center text-gray-400 mt-10">
              Nenhuma movimentação.
            </p>
          ) : (
            sortedTransactions.map((t) => (
              <div
                key={t.id}
                className="flex justify-between items-center bg-white border border-gray-100 p-4 rounded-xl shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      t.type === "BUY"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {t.type === "BUY" ? (
                      <ArrowDownLeft size={18} />
                    ) : (
                      <ArrowUpRight size={18} />
                    )}
                  </div>

                  <div>
                    <div className="font-bold text-gray-900">{t.ticker}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(t.date).toLocaleDateString("pt-BR")} •{" "}
                      {t.type === "BUY" ? "Compra" : "Venda"}
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="font-bold text-gray-900">
                      R$ {(t.price * t.quantity).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {t.quantity} x {t.price.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm("Excluir?")) onDelete(t.id);
                    }}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryModal;
