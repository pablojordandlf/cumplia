'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

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
  prohibited: { label: 'Prohibido', color: '#ef4444', light: '#fee2e2', icon: '🔴' },
  high_risk: { label: 'Alto Riesgo', color: '#f97316', light: '#ffedd5', icon: '🟠' },
  limited_risk: { label: 'Limitado', color: '#eab308', light: '#fef3c7', icon: '🟡' },
  minimal_risk: { label: 'Mínimo', color: '#22c55e', light: '#dcfce7', icon: '🟢' },
  unclassified: { label: 'Por Clasificar', color: '#6b7280', light: '#f3f4f6', icon: '⚪' },
};

export function RiskDistributionChart({ data, onRiskFilterChange, selectedRisk }: RiskDistributionChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'donut'>('bar');

  const chartData = [
    { name: 'Prohibido', value: data.prohibited, fill: RISK_CONFIG.prohibited.color, risk: 'prohibited' },
    { name: 'Alto Riesgo', value: data.high_risk, fill: RISK_CONFIG.high_risk.color, risk: 'high_risk' },
    { name: 'Limitado', value: data.limited_risk, fill: RISK_CONFIG.limited_risk.color, risk: 'limited_risk' },
    { name: 'Mínimo', value: data.minimal_risk, fill: RISK_CONFIG.minimal_risk.color, risk: 'minimal_risk' },
    { name: 'Sin clasificar', value: data.unclassified, fill: RISK_CONFIG.unclassified.color, risk: 'unclassified' },
  ];

  const total = Object.values(data).reduce((a, b) => a + b, 0);

  const donutData = chartData.map((item, index) => ({
    ...item,
    angle: (item.value / total) * 360,
  }));

  // Calculate pie slices
  let currentAngle = 0;
  const slices = donutData.map((item) => {
    const startAngle = currentAngle;
    const endAngle = currentAngle + item.angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const innerRadius = 40;
    const outerRadius = 70;

    const x1 = 100 + outerRadius * Math.cos(startRad);
    const y1 = 100 + outerRadius * Math.sin(startRad);
    const x2 = 100 + outerRadius * Math.cos(endRad);
    const y2 = 100 + outerRadius * Math.sin(endRad);

    const xi1 = 100 + innerRadius * Math.cos(startRad);
    const yi1 = 100 + innerRadius * Math.sin(startRad);
    const xi2 = 100 + innerRadius * Math.cos(endRad);
    const yi2 = 100 + innerRadius * Math.sin(endRad);

    const largeArc = item.angle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${xi2} ${yi2}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${xi1} ${yi1}`,
      'Z',
    ].join(' ');

    return {
      ...item,
      path: pathData,
      x1,
      y1,
    };
  });

  return (
    <div className="space-y-4">
      {/* Chart Type Toggle */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setChartType('bar')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
            chartType === 'bar'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
          }`}
        >
          Gráfico de barras
        </button>
        <button
          onClick={() => setChartType('donut')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
            chartType === 'donut'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
          }`}
        >
          Gráfico de dona
        </button>
      </div>

      {/* Bar Chart */}
      {chartType === 'bar' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-64"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="name" stroke="currentColor" opacity={0.5} />
              <YAxis stroke="currentColor" opacity={0.5} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 15, 9, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar
                dataKey="value"
                onClick={(data: any) => {
                  onRiskFilterChange?.(data.risk);
                }}
                style={{ cursor: 'pointer' }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    opacity={selectedRisk === null || selectedRisk === entry.risk ? 1 : 0.3}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Donut Chart */}
      {chartType === 'donut' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center"
        >
          <svg width={200} height={200} viewBox="0 0 200 200">
            {slices.map((slice, index) => (
              <motion.g
                key={index}
                onClick={() => onRiskFilterChange?.(slice.risk)}
                style={{ cursor: 'pointer' }}
                whileHover={{ scale: 1.05 }}
              >
                <path
                  d={slice.path}
                  fill={slice.fill}
                  stroke="white"
                  strokeWidth={2}
                  opacity={selectedRisk === null || selectedRisk === slice.risk ? 1 : 0.3}
                  style={{ transition: 'opacity 0.3s' }}
                />
                <text
                  x={slice.x1 - 10}
                  y={slice.y1}
                  fill="white"
                  fontSize={12}
                  fontWeight="bold"
                  textAnchor="middle"
                  opacity={selectedRisk === null || selectedRisk === slice.risk ? 1 : 0.3}
                >
                  {slice.value}
                </text>
              </motion.g>
            ))}
          </svg>
        </motion.div>
      )}

      {/* Legend and Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {chartData.map((item) => {
          const riskConfig = RISK_CONFIG[item.risk as keyof typeof RISK_CONFIG];
          return (
            <motion.button
              key={item.risk}
              onClick={() => onRiskFilterChange?.(selectedRisk === item.risk ? null : item.risk)}
              whileHover={{ scale: 1.02 }}
              style={{
                backgroundColor: selectedRisk === item.risk ? riskConfig.light : 'transparent',
                borderColor: selectedRisk === item.risk ? riskConfig.color : undefined,
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedRisk === item.risk
                  ? ''
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900'
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                <span>{riskConfig.icon}</span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.name}</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
