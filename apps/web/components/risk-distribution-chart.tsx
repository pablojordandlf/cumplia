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
  prohibited: { label: 'Prohibido', color: '#C92A2A', light: '#FFE8E8', icon: '🔴', gradient: 'from-[#C92A2A] to-[#E74C3C]', rgb: 'rgb(201, 42, 42)' },
  high_risk: { label: 'Alto Riesgo', color: '#D97706', light: '#FFF4E6', icon: '🟠', gradient: 'from-[#D97706] to-[#F59E0B]', rgb: 'rgb(217, 119, 6)' },
  limited_risk: { label: 'Limitado', color: '#B8860B', light: '#FFF8E8', icon: '🟡', gradient: 'from-[#B8860B] to-[#D4AF37]', rgb: 'rgb(184, 134, 11)' },
  minimal_risk: { label: 'Mínimo', color: '#27A844', light: '#E8F5EA', icon: '🟢', gradient: 'from-[#27A844] to-[#52C77A]', rgb: 'rgb(39, 168, 68)' },
  unclassified: { label: 'Por Clasificar', color: '#707070', light: '#F5F5F5', icon: '⚪', gradient: 'from-[#707070] to-[#999999]', rgb: 'rgb(112, 112, 112)' },
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
      className="bg-white/90 backdrop-blur-md border border-gray-300/60 rounded-xl p-4 shadow-lg"
    >
      <p className="text-gray-900 font-bold text-sm mb-2">{data.name}</p>
      <div className="space-y-1">
        <p className="text-gray-800 text-sm">
          <span className="font-semibold text-lg">{data.value}</span>
          <span className="text-gray-600 ml-2">sistemas</span>
        </p>
        <div className="w-32 h-2 bg-gray-400/40 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(data.value / (data.maxValue || 10)) * 100}%`,
              backgroundColor: data.fill,
            }}
          />
        </div>
        <p className="text-xs text-gray-600">
          <span className="font-medium">{Math.round((data.value / (data.maxValue || 10)) * 100)}%</span>
          <span className="ml-1">del total</span>
        </p>
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
        className="w-full h-96 p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200/80 shadow-md"
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.08)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="rgba(0, 0, 0, 0.3)"
              style={{ fontSize: '13px', fontWeight: '500' }}
              tick={{ fill: 'rgba(0, 0, 0, 0.6)' }}
              axisLine={{ stroke: 'rgba(0, 0, 0, 0.1)' }}
            />
            <YAxis
              stroke="rgba(0, 0, 0, 0.3)"
              style={{ fontSize: '13px' }}
              tick={{ fill: 'rgba(0, 0, 0, 0.6)' }}
              axisLine={{ stroke: 'rgba(0, 0, 0, 0.1)' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
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
                  ? `bg-gradient-to-br ${riskConfig.gradient} border-gray-600 shadow-md text-white ring-2 ring-gray-400/30`
                  : `border-gray-300/60 bg-gray-50/70 hover:border-gray-400/80 hover:bg-gray-100/70 ${!isHighlighted ? 'opacity-40' : ''}`
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
                isSelected ? 'text-white' : 'text-gray-700'
              }`}>
                {item.name}
              </p>
              <div className="space-y-2">
                <p className={`text-3xl font-black transition-colors ${
                  isSelected ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.value}
                </p>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-white/40' : 'bg-gray-300/40'}`}>
                  <motion.div
                    className={`h-full bg-gradient-to-r ${riskConfig.gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.2, duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className={`text-xs font-semibold transition-colors ${
                  isSelected ? 'text-white/90' : 'text-gray-600'
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
