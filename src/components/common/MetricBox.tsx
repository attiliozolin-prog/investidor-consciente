import Tooltip from "./Tooltip";

interface Props {
  label: string;
  value: string;
  tooltip?: string;
  highlight?: boolean;
}

export default function MetricBox({
  label,
  value,
  tooltip,
  highlight,
}: Props) {
  return (
    <div
      className={`p-3 rounded-xl border ${
        highlight
          ? "bg-orange-50 border-orange-200"
          : "bg-gray-50 border-gray-100"
      }`}
    >
      <div className="text-xs text-gray-500 mb-1">
        {tooltip ? <Tooltip term={tooltip} label={label} /> : label}
      </div>
      <div
        className={`text-lg font-bold ${
          highlight ? "text-orange-700" : "text-gray-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
