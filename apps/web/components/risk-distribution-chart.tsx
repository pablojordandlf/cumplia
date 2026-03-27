'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { useState } from 'react';

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
  prohibited: { label: 'Prohibido', color: '#dc2626', light: '#fee2e2', icon: '🔴', gradient: 'from-red-600 to-red-500', rgb: 'rgb(220, 38, 38)' },
  high_risk: { label: 'Alto Riesgo', color: '#ea580c', light: '#ffedd5', icon: '🟠', gradient: 'from-orange-600 to-orange-500', rgb: 'rgb(234, 88, 12)' },
  limited_risk: { label: 'Limitado', color: '#ca8a04', light: '#fef3c7', icon: '🟡', gradient: 'from-yellow-600 to-yellow-500', rgb: 'rgb(202, 138, 4)' },
  minimal_risk: { label: 'Mínimo', color: '#16a34a', light: '#dcfce7', icon: '🟢', gradient: 'from-green-600 to-green-500', rgb: 'rgb(22, 163, 74)' },
  unclassified: { label: 'Por Clasificar', color: '#6b7280', light: '#f3f4f6', icon: '⚪', gradient: 'from-gray-600 to-gray-500', rgb: 'rgb(107, 114, 128)' },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl"
    >
      <p className="text-white font-bold text-sm mb-2">{data.name}</p>
      <div className="space-y-1">
        <p className="text-white/90 text-sm">
          <span className="font-semibold text-lg">{data.value}</span>
          <span className="text-white/60 ml-2">sistemas</span>
        </p>
        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(data.value / (data.maxValue || 10)) * 100}%`,
              backgroundColor: data.fill,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export function RiskDistributionChart({ data, onRiskFilterChange, selectedRisk }: RiskDistributionChartProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const chartData = [
    { name: 'Prohibido', value: data.prohibited, fill: RISK_CONFIG.prohibited.color, risk: 'prohibited', maxValue: Math.max(data.prohibited, data.high_risk, data.limited_risk, data.minimal_risk, data.unclassified) || 10 },
    { name: 'Alto Riesgo', value: data.high_risk, fill: RISK_CONFIG.high_risk.color, risk: 'high_risk', maxValue: Math.max(data.prohibited, data.high_risk, data.limited_risk, data.minimal_risk, data.unclassified) || 10 },
    { name: 'Limitado', value: data.limited_risk, fill: RISK_CONFIG.limited_risk.color, risk: 'limited_risk', maxValue: Math.max(data.prohibited, data.high_risk, data.limited_risk, data.minimal_risk, data.unclassified) || 10 },
    { name: 'Mínimo', value: data.minimal_risk, fill: RISK_CONFIG.minimal_risk.color, risk: 'minimal_risk', maxValue: Math.max(data.prohibited, data.high_risk, data.limited_risk, data.minimal_risk, data.unclassified) || 10 },
    { name: 'Sin clasificar', value: data.unclassified, fill: RISK_CONFIG.unclassified.color, risk: 'unclassified', maxValue: Math.max(data.prohibited, data.high_risk, data.limited_risk, data.minimal_risk, data.unclassified) || 10 },
  ];

  const total = Object.values(data).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      {/* Enhanced Bar Chart - Premium Visual Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-96 p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 via-slate-900/30 to-slate-950/50 backdrop-blur-xl border border-white/15 shadow-2xl"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 30, right: 30, left: 0, bottom: 50 }}
            onMouseMove={(state: any) => {
              if (state.isTooltipActive && state.activeTooltipIndex !== undefined) {
                setHoveredBar(chartData[state.activeTooltipIndex]?.risk || null);
              }
            }}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <defs>
              {chartData.map((item, idx) => (
                <linearGradient key={`grad-${idx}`} id={`gradient-${item.risk}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={item.fill} stopOpacity={1} />
                  <stop offset="50%" stopColor={item.fill} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={item.fill} stopOpacity={0.6} />
                </linearGradient>
              ))}
              {/* Shadow filter for depth */}
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.3" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="rgba(255, 255, 255, 0.5)"
              style={{ fontSize: '13px', fontWeight: '500' }}
              tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.5)"
              style={{ fontSize: '13px' }}
              tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }} />
            <Bar
              dataKey="value"
              onClick={(data: any) => {
                onRiskFilterChange?.(data.risk);
              }}
              style={{ cursor: 'pointer' }}
              radius={[20, 20, 0, 0]}
              animationDuration={800}
              animationEasing="ease-out"
              filter="url(#shadow)"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#gradient-${entry.risk})`}
                  opacity={selectedRisk === null || selectedRisk === entry.risk ? 1 : 0.25}
                  style={{
                    cursor: 'pointer',
                    transition: 'opacity 0.3s ease',
                    filter: hoveredBar === entry.risk ? 'brightness(1.15) drop-shadow(0 0 12px rgba(255, 255, 255, 0.3))' : 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Statistics Row - High Contrast Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {chartData.map((item, idx) => {
          const riskConfig = RISK_CONFIG[item.risk as keyof typeof RISK_CONFIG];
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const isSelected = selectedRisk === item.risk;
          const isHighlighted = selectedRisk === null || isSelected;

          return (
            <motion.button
              key={item.risk}
              onClick={() => onRiskFilterChange?.(selectedRisk === item.risk ? null : item.risk)}
              whileHover={{ scale: 1.06, translateY: -4 }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`p-5 rounded-xl border-2 transition-all duration-300 backdrop-blur-md group ${
                isSelected
                  ? `bg-gradient-to-br ${riskConfig.gradient} border-white/40 shadow-2xl shadow-${item.fill}/30 ring-2 ring-white/20`
                  : `border-white/20 bg-slate-800/60 hover:border-white/40 hover:bg-slate-800/80 ${!isHighlighted ? 'opacity-40' : ''}`
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-3xl transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                  {riskConfig.icon}
                </span>
                {isSelected && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="w-2.5 h-2.5 rounded-full bg-white"
                  />
                )}
              </div>
              <p className={`text-xs font-bold mb-2 transition-colors uppercase tracking-wider ${
                isSelected ? 'text-white' : 'text-white/70'
              }`}>
                {item.name}
              </p>
              <div className="space-y-2">
                <p className={`text-3xl font-black transition-colors ${
                  isSelected ? 'text-white' : 'text-white/90'
                }`}>
                  {item.value}
                </p>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-white/30' : 'bg-white/10'}`}>
                  <motion.div
                    className={`h-full bg-gradient-to-r ${riskConfig.gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.2, duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className={`text-xs font-semibold transition-colors ${
                  isSelected ? 'text-white/90' : 'text-white/60'
                }`}>
                  {percentage}% del total
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
