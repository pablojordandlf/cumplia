'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
  prohibited: { label: 'Prohibido', color: '#dc2626', light: '#fee2e2', icon: '🔴', gradient: 'from-red-600 to-red-500' },
  high_risk: { label: 'Alto Riesgo', color: '#ea580c', light: '#ffedd5', icon: '🟠', gradient: 'from-orange-600 to-orange-500' },
  limited_risk: { label: 'Limitado', color: '#ca8a04', light: '#fef3c7', icon: '🟡', gradient: 'from-yellow-600 to-yellow-500' },
  minimal_risk: { label: 'Mínimo', color: '#16a34a', light: '#dcfce7', icon: '🟢', gradient: 'from-green-600 to-green-500' },
  unclassified: { label: 'Por Clasificar', color: '#6b7280', light: '#f3f4f6', icon: '⚪', gradient: 'from-gray-600 to-gray-500' },
};

export function RiskDistributionChart({ data, onRiskFilterChange, selectedRisk }: RiskDistributionChartProps) {
  const chartData = [
    { name: 'Prohibido', value: data.prohibited, fill: RISK_CONFIG.prohibited.color, risk: 'prohibited' },
    { name: 'Alto Riesgo', value: data.high_risk, fill: RISK_CONFIG.high_risk.color, risk: 'high_risk' },
    { name: 'Limitado', value: data.limited_risk, fill: RISK_CONFIG.limited_risk.color, risk: 'limited_risk' },
    { name: 'Mínimo', value: data.minimal_risk, fill: RISK_CONFIG.minimal_risk.color, risk: 'minimal_risk' },
    { name: 'Sin clasificar', value: data.unclassified, fill: RISK_CONFIG.unclassified.color, risk: 'unclassified' },
  ];

  const total = Object.values(data).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Modern Bar Chart with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-80 p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <defs>
              {chartData.map((item, idx) => (
                <linearGradient key={`grad-${idx}`} id={`gradient-${item.risk}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={item.fill} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={item.fill} stopOpacity={0.4} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255, 255, 255, 0.3)" 
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="rgba(255, 255, 255, 0.3)" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 15, 9, 0.98)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: '#fff',
                padding: '12px',
              }}
              formatter={(value: any) => [value, 'Sistemas']}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            <Bar
              dataKey="value"
              onClick={(data: any) => {
                onRiskFilterChange?.(data.risk);
              }}
              style={{ cursor: 'pointer' }}
              radius={[12, 12, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#gradient-${entry.risk})`}
                  opacity={selectedRisk === null || selectedRisk === entry.risk ? 1 : 0.2}
                  style={{ cursor: 'pointer', transition: 'opacity 0.3s' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Interactive Risk Level Cards - Premium Design */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {chartData.map((item, idx) => {
          const riskConfig = RISK_CONFIG[item.risk as keyof typeof RISK_CONFIG];
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const isSelected = selectedRisk === item.risk;
          const isHighlighted = selectedRisk === null || isSelected;

          return (
            <motion.button
              key={item.risk}
              onClick={() => onRiskFilterChange?.(selectedRisk === item.risk ? null : item.risk)}
              whileHover={{ scale: 1.05, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm ${
                isSelected
                  ? `bg-gradient-to-br ${riskConfig.gradient} border-white/30 shadow-lg shadow-${item.fill}/20`
                  : `border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 ${!isHighlighted ? 'opacity-30' : ''}`
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{riskConfig.icon}</span>
                {isSelected && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-3 h-3 rounded-full bg-white/70"
                  />
                )}
              </div>
              <p className={`text-xs font-semibold mb-1 transition-colors ${
                isSelected ? 'text-white' : 'text-gray-400'
              }`}>
                {item.name}
              </p>
              <p className={`text-2xl font-bold transition-colors ${
                isSelected ? 'text-white' : 'text-gray-100'
              }`}>
                {item.value}
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className={`w-full h-1.5 rounded-full bg-white/10 overflow-hidden`}>
                  <motion.div
                    className={`h-full bg-gradient-to-r ${riskConfig.gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  />
                </div>
              </div>
              <p className={`text-xs font-medium mt-1 transition-colors ${
                isSelected ? 'text-white/80' : 'text-gray-400'
              }`}>
                {percentage}%
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
