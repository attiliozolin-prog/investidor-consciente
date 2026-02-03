const PortfolioDashboard: React.FC<any> = ({
  userProfile,
  transactions,
  onAddTransaction,
  onDeleteAsset,
  onDeleteTransaction,
  rankedStocks,
  showValues,
}) => {
  const [contributionAmount, setContributionAmount] = useState<string>("");
  const [smartSuggestion, setSmartSuggestion] = useState<
    { ticker: string; qty: number; cost: number; reason: string }[] | null
  >(null);
  const [suggestionType, setSuggestionType] = useState<string>("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const contributionSectionRef = useRef<HTMLDivElement>(null);

  const holdings: Holding[] = useMemo(() => {
    const map = new Map<string, { qty: number; totalCost: number }>();
    transactions.forEach((t: Transaction) => {
      const current = map.get(t.ticker) || { qty: 0, totalCost: 0 };
      if (t.type === "BUY") {
        map.set(t.ticker, {
          qty: current.qty + t.quantity,
          totalCost: current.totalCost + t.quantity * t.price,
        });
      } else {
        const avgPrice = current.qty > 0 ? current.totalCost / current.qty : 0;
        map.set(t.ticker, {
          qty: current.qty - t.quantity,
          totalCost: current.totalCost - t.quantity * avgPrice,
        });
      }
    });
    const result: Holding[] = [];
    let totalPortfolioValue = 0;
    map.forEach((value, ticker) => {
      if (value.qty > 0 || (value.qty === 0 && value.totalCost > 0)) {
        if (value.qty <= 0 && value.totalCost <= 0) return;
        const stockInfo = STOCKS_DB.find((s) => s.ticker === ticker);
        const currentPrice = stockInfo ? stockInfo.price : 0;
        let totalValue =
          stockInfo?.assetType === "fixed_income"
            ? value.totalCost
            : value.qty * currentPrice;
        totalPortfolioValue += totalValue;
        result.push({
          ticker,
          assetType: stockInfo?.assetType || "stock",
          quantity: value.qty,
          averagePrice: value.qty > 0 ? value.totalCost / value.qty : 0,
          currentPrice:
            stockInfo?.assetType === "fixed_income"
              ? value.qty > 0
                ? value.totalCost / value.qty
                : 0
              : currentPrice,
          totalValue,
          profit: totalValue - value.totalCost,
          profitPercent:
            value.totalCost > 0
              ? ((totalValue - value.totalCost) / value.totalCost) * 100
              : 0,
          allocationPercent: 0,
        });
      }
    });
    return result
      .map((h) => ({
        ...h,
        allocationPercent:
          totalPortfolioValue > 0
            ? (h.totalValue / totalPortfolioValue) * 100
            : 0,
      }))
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [transactions]);

  const totalBalance = holdings.reduce((acc, h) => acc + h.totalValue, 0);
  const totalInvested = holdings.reduce(
    (acc, h) => acc + h.quantity * h.averagePrice,
    0
  );
  const totalProfit = totalBalance - totalInvested;

  const getRiskTargets = (risk: RiskProfile | null) => {
    switch (risk) {
      case RiskProfile.CONSERVATIVE:
        return { fixed_income: 60, fii: 25, stock: 15 };
      case RiskProfile.BOLD:
        return { fixed_income: 10, fii: 30, stock: 60 };
      default:
        return { fixed_income: 30, fii: 40, stock: 30 };
    }
  };
  const targets = getRiskTargets(userProfile.riskProfile);
  const currentAllocation = useMemo(() => {
    const alloc: any = { fixed_income: 0, fii: 0, stock: 0 };
    holdings.forEach((h) => {
      if (h.assetType in alloc) alloc[h.assetType] += h.totalValue;
    });
    if (totalBalance === 0) return { fixed_income: 0, fii: 0, stock: 0 };
    return {
      fixed_income: (alloc.fixed_income / totalBalance) * 100,
      fii: (alloc.fii / totalBalance) * 100,
      stock: (alloc.stock / totalBalance) * 100,
    };
  }, [holdings, totalBalance]);

  const allocationDeviation =
    Math.abs(currentAllocation.fixed_income - targets.fixed_income) +
    Math.abs(currentAllocation.fii - targets.fii) +
    Math.abs(currentAllocation.stock - targets.stock);
  const isBalanced = allocationDeviation < 20;

  const handleCalculateContribution = () => {
    const amount = parseFloat(contributionAmount);
    if (!amount || amount <= 0) return;
    const gaps = {
      fixed_income: targets.fixed_income - currentAllocation.fixed_income,
      fii: targets.fii - currentAllocation.fii,
      stock: targets.stock - currentAllocation.stock,
    };
    const sortedGaps = Object.entries(gaps).sort(([, a], [, b]) => b - a);
    const priorityClass = sortedGaps[0][0] as AssetType;
    const priorityGap = sortedGaps[0][1];
    let targetAssets: any = [];
    let suggestionLabel = "";

    if (priorityGap > 0) {
      targetAssets = rankedStocks.filter(
        (s: any) => s.assetType === priorityClass
      );
      suggestionLabel =
        priorityClass === "fixed_income"
          ? "Foco: Renda Fixa"
          : priorityClass === "fii"
          ? "Foco: FIIs"
          : "Foco: Ações";
    } else {
      targetAssets = rankedStocks;
      suggestionLabel = "Foco: Diversificação Geral";
    }
    setSuggestionType(suggestionLabel);

    let remainingMoney = amount;
    const finalBuyList: any[] = [];
    const candidates = targetAssets.slice(0, 3);

    for (const item of candidates) {
      if (remainingMoney < item.price) continue;
      let qtyToBuy = 0;
      if (item.assetType === "fixed_income") {
        if (finalBuyList.length === 0) {
          qtyToBuy = 1;
          finalBuyList.push({
            ticker: item.ticker,
            qty: 1,
            cost: remainingMoney,
            reason: `Opção Segura`,
          });
          remainingMoney = 0;
          break;
        }
      } else {
        const maxAffordable = Math.floor(remainingMoney / item.price);
        qtyToBuy = Math.min(
          maxAffordable,
          Math.floor(amount / candidates.length / item.price) + 1
        );
        if (qtyToBuy > 0) {
          const cost = qtyToBuy * item.price;
          finalBuyList.push({
            ticker: item.ticker,
            qty: qtyToBuy,
            cost: cost,
            reason: `Top Ranking`,
          });
          remainingMoney -= cost;
        }
      }
    }
    setSmartSuggestion(finalBuyList);
  };
  const realAllocationData = holdings.map((h) => ({
    name: h.ticker,
    value: h.totalValue,
  }));
  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#6b7280",
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-32">
      {holdings.length > 0 && (
        <div
          onClick={() =>
            contributionSectionRef.current?.scrollIntoView({
              behavior: "smooth",
            })
          }
          className={`cursor-pointer ${
            isBalanced
              ? "bg-emerald-100 border-emerald-200"
              : "bg-orange-100 border-orange-200"
          } border p-4 rounded-3xl flex items-center gap-4 shadow-sm`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isBalanced
                ? "bg-emerald-200 text-emerald-700"
                : "bg-orange-200 text-orange-700"
            }`}
          >
            {isBalanced ? <Check size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div>
            <h3
              className={`font-bold text-sm ${
                isBalanced ? "text-emerald-900" : "text-orange-900"
              }`}
            >
              {isBalanced ? "Carteira Equilibrada" : "Rebalanceamento Sugerido"}
            </h3>
            <p
              className={`text-xs ${
                isBalanced ? "text-emerald-700" : "text-orange-800"
              }`}
            >
              {isBalanced ? "Tudo certo." : "Toque para corrigir."}
            </p>
          </div>
        </div>
      )}
      <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl shadow-gray-900/20">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
          <Wallet size={16} /> Patrimônio Total
        </div>
        <div className="text-4xl font-bold mb-6">
          {showValues
            ? `R$ ${totalBalance.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}`
            : "••••••••"}
        </div>
        <div className="grid grid-cols-2 gap-8 border-t border-gray-800 pt-4">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
              Investido
            </div>
            <div className="font-semibold text-xl text-gray-300">
              {showValues
                ? `R$ ${totalInvested.toLocaleString("pt-BR", {
                    minimumFractionDigits: 0,
                  })}`
                : "••••"}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
              Resultado
            </div>
            <div
              className={`font-semibold text-xl flex items-center gap-1 ${
                totalProfit >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {totalProfit >= 0 ? (
                <TrendingUp size={18} />
              ) : (
                <TrendingDown size={18} />
              )}
              {showValues
                ? `R$ ${Math.abs(totalProfit).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`
                : "••••"}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Layers size={20} className="text-emerald-500" />
          Alocação
        </h3>
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>Renda Fixa</span>
              <span>
                {currentAllocation.fixed_income.toFixed(1)}% /{" "}
                {targets.fixed_income}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{
                  width: `${Math.min(currentAllocation.fixed_income, 100)}%`,
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>FIIs</span>
              <span>
                {currentAllocation.fii.toFixed(1)}% / {targets.fii}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{ width: `${Math.min(currentAllocation.fii, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>Ações</span>
              <span>
                {currentAllocation.stock.toFixed(1)}% / {targets.stock}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${Math.min(currentAllocation.stock, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        ref={contributionSectionRef}
        className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-6 rounded-3xl shadow-sm relative overflow-hidden"
      >
        <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2 mb-2 relative z-10">
          <Coins className="text-emerald-600" /> Aporte Inteligente
        </h3>
        <p className="text-sm text-emerald-700 mb-4 relative z-10 max-w-xs">
          Nossa IA equilibra sua carteira.
        </p>
        <div className="flex gap-2 relative z-10">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
              R$
            </span>
            <input
              type="number"
              placeholder="0,00"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
            />
          </div>
          <button
            onClick={handleCalculateContribution}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 rounded-xl transition-colors font-bold shadow-lg shadow-emerald-200"
          >
            Calcular
          </button>
        </div>
        {smartSuggestion && (
          <div className="mt-6 bg-white/80 backdrop-blur rounded-2xl p-4 border border-emerald-100">
            <h4 className="text-sm font-bold text-gray-900 mb-3">
              {suggestionType}
            </h4>
            {smartSuggestion.map((item) => (
              <div
                key={item.ticker}
                className="flex justify-between items-center p-2 mb-2 bg-white rounded-lg border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    {item.ticker.substring(0, 3)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">
                      {item.qty}x {item.ticker}
                    </div>
                  </div>
                </div>
                <div className="font-bold text-emerald-700 text-sm">
                  R$ {item.cost.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-4">
        <button
          onClick={onAddTransaction}
          className="w-full py-4 border-2 border-dashed border-emerald-300 bg-emerald-50 rounded-2xl flex items-center justify-center gap-2 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors"
        >
          <Plus size={20} /> Adicionar Novo Ativo
        </button>
        {holdings.length > 0 && (
          <>
            <div className="flex justify-between items-center px-2 mt-4">
              <h3 className="font-bold text-gray-900">Seus Ativos</h3>
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
              >
                <History size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {holdings.map((h) => (
                <div
                  key={h.ticker}
                  className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        h.assetType === "fixed_income"
                          ? "bg-blue-50 text-blue-700"
                          : h.assetType === "fii"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {h.ticker.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{h.ticker}</h4>
                      <p className="text-xs text-gray-500">
                        {h.assetType === "fixed_income"
                          ? "Aplicação"
                          : `${h.quantity} cotas`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        {showValues ? `R$ ${h.totalValue.toFixed(0)}` : "••••"}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAsset(h.ticker);
                      }}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mt-8">
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={realAllocationData}
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {realAllocationData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
      {isHistoryOpen && (
        <TransactionHistoryModal
          transactions={transactions}
          onClose={() => setIsHistoryOpen(false)}
          onDelete={(id) => {
            if (onDeleteTransaction) onDeleteTransaction(id);
          }}
        />
      )}
    </div>
  );
};

