import { ChartNoAxesCombined, TrendingUp, TrendingDown } from 'lucide-react';

import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid, Legend
} from 'recharts';
import styles from './ImprovementTimeline.module.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipScore}>{payload[0].value}%</p>
    </div>
  );
};

const ImprovementTimeline = ({ data }) => {
  // useMemo: we only re-compute this when `data` changes, not on every render.
  const topicGroups = useMemo(() => {
    const groups = {};
    const sorted = [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    sorted.forEach(item => {
      const topic = item.topic && item.topic !== 'Unknown' ? item.topic : 'General';
      if (!groups[topic]) groups[topic] = [];
      groups[topic].push({
        date: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.round((item.score / item.totalQuestions) * 100),
        difficulty: item.difficulty,
        raw: `${item.score}/${item.totalQuestions}`,
      });
    });

    return groups;
  }, [data]);

  const topics = Object.keys(topicGroups).filter(t => topicGroups[t].length >= 2);

  const [selectedTopic, setSelectedTopic] = useState(topics[0] || '');

  if (topics.length === 0) {
    return (
      <div className={styles.wrapper}>
        <h3 className={styles.title}> <ChartNoAxesCombined /> Improvement Timeline</h3>
        <p className={styles.empty}>
          Practice a topic at least twice to see your improvement trend here!
        </p>
      </div>
    );
  }

  const chartData = topicGroups[selectedTopic] || [];

  const avgScore = Math.round(chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length);

  const firstScore = chartData[0]?.score ?? 0;
  const lastScore  = chartData[chartData.length - 1]?.score ?? 0;
  const isImproving = lastScore >= firstScore;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}><ChartNoAxesCombined /> Improvement Timeline</h3>
          <p className={styles.subtitle}>
            Track how your score on each topic changes over time.
          </p>
        </div>

        <select
          className={styles.select}
          value={selectedTopic}
          onChange={e => setSelectedTopic(e.target.value)}
        >
          {topics.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className={`${styles.trendBadge} ${isImproving ? styles.trendUp : styles.trendDown}`}>
        {isImproving ? <><TrendingUp size={16} /> Improving</> : <><TrendingDown size={16} /> Declining</>} — last vs first session
      </div>

      <div style={{ height: 260, marginTop: '16px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ right: 20, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
            <XAxis
              dataKey="date"
              stroke="var(--text)"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              stroke="var(--text)"
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />

            <ReferenceLine
              y={avgScore}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{ value: `Avg: ${avgScore}%`, fill: '#f59e0b', fontSize: 11, position: 'right' }}
            />

            <Line
              type="monotone"
              dataKey="score"
              stroke={isImproving ? '#10b981' : '#ef4444'}
              strokeWidth={2.5}
              dot={{ r: 5, fill: isImproving ? '#10b981' : '#ef4444', strokeWidth: 0 }}
              activeDot={{ r: 7 }}
              name="Score %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className={styles.sessionCount}>
        {chartData.length} session{chartData.length !== 1 ? 's' : ''} on <strong>{selectedTopic}</strong>
      </p>
    </div>
  );
};

export default ImprovementTimeline;
