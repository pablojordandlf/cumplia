'use client';

interface RiskDistributionChartProps {
  data: {
    prohibited: number;
    high_risk: number;
    limited_risk: number;
    minimal_risk: number;
    unclassified: number;
  };
  onRiskFilterChange?: (risk: string | null) => void;
  selectedRisk?: string | null;
}

const RISK_CONFIG = {
  prohibited:    { label: 'Prohibido',       color: 'bg-red-500',    text: 'text-red-600',    dot: 'bg-red-500',    bar: 'bg-red-500'    },
  high_risk:     { label: 'Alto riesgo',     color: 'bg-orange-400', text: 'text-orange-600', dot: 'bg-orange-400', bar: 'bg-orange-400' },
  limited_risk:  { label: 'Riesgo limitado', color: 'bg-yellow-400', text: 'text-yellow-600', dot: 'bg-yellow-400', bar: 'bg-yellow-400' },
  minimal_risk:  { label: 'Riesgo mínimo',   color: 'bg-green-500',  text: 'text-green-600',  dot: 'bg-green-500',  bar: 'bg-green-500'  },
  unclassified:  { label: 'Sin clasificar',  color: 'bg-gray-300',   text: 'text-gray-500',   dot: 'bg-gray-300',   bar: 'bg-gray-300'   },
};

export function RiskDistributionChart({ data, onRiskFilterChange, selectedRisk }: RiskDistributionChartProps) {
  const entries = [
    { key: 'prohibited'   as const, value: data.prohibited   },
    { key: 'high_risk'    as const, value: data.high_risk    },
    { key: 'limited_risk' as const, value: data.limited_risk },
    { key: 'minimal_risk' as const, value: data.minimal_risk },
    { key: 'unclassified' as const, value: data.unclassified },
  ];

  const total = entries.reduce((sum, e) => sum + e.value, 0);
  const maxValue = Math.max(...entries.map(e => e.value), 1);

  return (
    <div className="space-y-3">
      {entries.map(({ key, value }) => {
        const cfg = RISK_CONFIG[key];
        const pct = total > 0 ? Math.round((value / total) * 100) : 0;
        const barWidth = Math.round((value / maxValue) * 100);
        const isSelected = selectedRisk === key;
        const dimmed = selectedRisk !== null && !isSelected;

        return (
          <button
            key={key}
            onClick={() => onRiskFilterChange?.(isSelected ? null : key)}
            className={`w-full text-left group transition-opacity ${dimmed ? 'opacity-40' : 'opacity-100'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <span className={`text-sm font-medium ${isSelected ? cfg.text : 'text-gray-700'}`}>
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">{value}</span>
                <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
              </div>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </button>
        );
      })}

      {total === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">Sin sistemas registrados</p>
      )}
    </div>
  );
}
