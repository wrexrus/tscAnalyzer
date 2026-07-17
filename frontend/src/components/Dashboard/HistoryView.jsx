
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import ContributionHeatmap from './ContributionHeatmap';
import HistoryCard from './HistoryCard';
import LanguagePieChart from './LanguagePieChart';
import styles from '../../pages/Dashboard.module.css';

const HistoryView = ({ data }) => {
  if (data.length === 0) return <p className={styles.empty}>No analysis history found. Analyze some code to see insights here!</p>;


  const filteredData = data.filter(item => {
    const isAnalyze = !item.actionType || item.actionType === 'analyze';
    const noErrors = !String(item.timeComplexity).toLowerCase().includes('error') &&
                     !String(item.timeComplexity).toLowerCase().includes('n/a') &&
                     !String(item.topic).toLowerCase().includes('error');
    return isAnalyze && noErrors;
  });

  if (filteredData.length === 0) return <p className={styles.empty}>No clean analysis history found yet.</p>;


  const topicCount      = {};
  const complexityCount = {};
  const allMistakes     = [];
  let recentLevel       = 'Unknown';

  filteredData.forEach(item => {
    const t = item.topic           && item.topic !== 'Unknown'           ? item.topic           : 'General';
    const c = item.timeComplexity  && item.timeComplexity !== 'Unknown'  ? item.timeComplexity  : 'N/A';

    topicCount[t]      = (topicCount[t] || 0) + 1;
    complexityCount[c] = (complexityCount[c] || 0) + 1;

    if (item.developerLevel && item.developerLevel !== 'Unknown' && recentLevel === 'Unknown') {
      recentLevel = item.developerLevel;
    }
    if (item.mistakes && Array.isArray(item.mistakes)) {
      item.mistakes.forEach(m => allMistakes.push(m));
    }
  });

  if (recentLevel === 'Unknown') recentLevel = 'Beginner';


  const mistakeFrequencies = {};
  allMistakes.forEach(m => { mistakeFrequencies[m] = (mistakeFrequencies[m] || 0) + 1; });
  const topMistakes = Object.entries(mistakeFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([mistake]) => mistake);

  const topicData      = Object.keys(topicCount).map(key => ({ subject: key, A: topicCount[key], fullMark: Math.max(...Object.values(topicCount)) + 2 }));
  const complexityData = Object.keys(complexityCount).map(key => ({ name: key, count: complexityCount[key] }));

  return (
    <div>
      {/* Coding activity heatmap */}
      <ContributionHeatmap data={data} title="Coding Analysis Streak" />

      {/* Coder Level + Mistakes row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div className={styles.card} style={{ flex: '1 1 180px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text)', opacity: 0.8, marginBottom: '15px' }}>Current Coder Level</h3>
          <h1 style={{ fontSize: '2.8rem', color: 'var(--primary)', fontFamily: "'Playfair Display', serif", margin: 0 }}>
            {recentLevel}
          </h1>
        </div>
        <div className={styles.card} style={{ flex: '2 1 300px' }}>
          <h3 style={{ color: 'var(--text)', opacity: 0.8, marginBottom: '15px' }}>Common Mistakes Log</h3>
          {topMistakes.length > 0 ? (
            <ul style={{ paddingLeft: '20px', color: 'var(--text)', lineHeight: '1.7' }}>
              {topMistakes.map((m, idx) => <li key={idx} style={{ marginBottom: '6px' }}>{m}</li>)}
            </ul>
          ) : (
            <p style={{ color: 'var(--text)', opacity: 0.7 }}>No repeated mistakes — keep coding cleanly! 🎉</p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {/* Skill radar */}
        <div style={{ flex: '1 1 280px', height: 280, background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '25px', borderRadius: '8px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text)' }}>Skill Radar</h2>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={topicData}>
              <PolarGrid stroke="var(--card-border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text)', fontSize: 17 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar name="Analyzed" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text)' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* [NEW] Language distribution pie */}
        <LanguagePieChart data={filteredData} />

        {/* Time complexity bar */}
        <div style={{ flex: '1 1 280px', height: 320, background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '20px', borderRadius: '8px' }}>
          <h4 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text)' }}>Time Complexities Used</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={complexityData} margin={{ bottom: 40 }}>
              <XAxis dataKey="name" stroke="var(--text)" tick={{ fontSize: 11, angle: -45, textAnchor: 'end' }} interval={0} />
              <YAxis stroke="var(--text)" />
              <Tooltip cursor={{ fill: 'var(--bg)' }} contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text)' }} />
              <Bar dataKey="count" fill="#84cc16" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* [NEW] Expandable history cards — full analysis on demand */}
      <div className={styles.list}>
        {filteredData.map((item, idx) => (
          <HistoryCard key={idx} item={item} />
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
