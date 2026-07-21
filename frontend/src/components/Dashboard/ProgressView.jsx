
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import ContributionHeatmap from './ContributionHeatmap';
import TopicStrengthTable from './TopicStrengthTable';
import ImprovementTimeline from './ImprovementTimeline';
import XpBadgePanel from './XpBadgePanel';
import LearningRoadmap from './LearningRoadmap';
import styles from '../../pages/Dashboard.module.css';

const ProgressView = ({ data }) => {
  if (data.length === 0) return <p className={styles.empty}>No quiz history found. Take a quiz to see your progress here!</p>;

  const scoreData = data
    .map((d, i) => ({ name: `Q${data.length - i}`, score: Math.round((d.score / d.totalQuestions) * 100) }))
    .reverse();

  const topicGrip = {};
  data.forEach(item => {
    const t = item.topic && item.topic !== 'Unknown' ? item.topic : 'General';
    if (!topicGrip[t]) topicGrip[t] = { score: 0, count: 0 };
    topicGrip[t].score += Math.round((item.score / item.totalQuestions) * 100);
    topicGrip[t].count += 1;
  });
  const radarData = Object.keys(topicGrip).map(key => ({
    subject: key,
    A: Math.round(topicGrip[key].score / topicGrip[key].count),
    fullMark: 100,
  }));

  return (
    <div>
      <ContributionHeatmap data={data} title="Quiz Activity Streak" />
  
      <XpBadgePanel data={data} />

     
      <LearningRoadmap data={data} />

      <div className={styles.chartRow}>
        <div className={styles.chartBox}>
          <h4 className={styles.chartTitle}>Recent Quiz Scores (%)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreData}>
              <XAxis dataKey="name" stroke="var(--text)" />
              <YAxis stroke="var(--text)" domain={[0, 100]} />
              <Tooltip cursor={{ fill: 'var(--bg)' }} contentStyle={{ marginTop:'10px',backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text)' }} />
              <Bar dataKey="score" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartBox}>
          <h4 className={styles.chartTitle}>Concept Grip (Radar)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
              <PolarGrid stroke="var(--card-border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text)', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Score" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text)' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* [NEW] Improvement Timeline — per-topic score trend over time */}
      <ImprovementTimeline data={data} />

      {/* Topic Strength Table — precise per-topic scores & status */}
      <TopicStrengthTable data={data} />

      {/* Individual quiz history cards */}
      <div className={styles.list}>
        {data.map((item, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.cardHeader}>
              <h4 className={styles.cardTitle}>{item.topic}</h4>
              <span className={styles.score}>{item.score} / {item.totalQuestions}</span>
            </div>
            <div className={styles.cardMeta}>
              <span>{item.category} • <span style={{ textTransform: 'capitalize' }}>{item.difficulty}</span></span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressView;
