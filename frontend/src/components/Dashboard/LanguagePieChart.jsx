import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#14b8a6'];


const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
  if (percent < 0.07) return null; // skip tiny slices so text doesn't overlap
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {name}
    </text>
  );
};

const LanguagePieChart = ({ data }) => {
  // ── Aggregate: count how many times each language appears ──
  const langCount = {};
  data.forEach(item => {
    const lang = item.language && item.language !== 'Unknown' ? item.language : 'Other';
    langCount[lang] = (langCount[lang] || 0) + 1;
  });

  const chartData = Object.entries(langCount).map(([name, value]) => ({ name, value }));

  if (chartData.length === 0) return null;

  return (
    <div style={{ flex: '1 1 300px', height: 280, background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '20px', borderRadius: '8px' }}>
      <h4 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--text)' }}>
        Language Distribution
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            outerRadius="65%"
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
            formatter={(value, name) => [`${value} analysis`, name]}
          />
          <Legend wrapperStyle={{ color: 'var(--text)', fontSize: '0.85rem', paddingTop: '8px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LanguagePieChart;
