import React from 'react';
import styles from './TopicStrengthTable.module.css';


const TopicStrengthTable = ({ data }) => {
  // ── Step 1: Aggregate scores by topic ──
  // WHY: The raw data has one entry per quiz attempt. We need to roll them
  // up so we have one row per topic with the average score across all attempts.
  const topicMap = {};

  data.forEach(item => {
    const topic = item.topic && item.topic !== 'Unknown' ? item.topic : 'General';
    if (!topicMap[topic]) {
      topicMap[topic] = { totalScore: 0, totalQuestions: 0, attempts: 0 };
    }
    topicMap[topic].totalScore     += item.score;
    topicMap[topic].totalQuestions += item.totalQuestions;
    topicMap[topic].attempts       += 1;
  });

  // ── Step 2: Convert the map to an array and compute avg % ──
  const rows = Object.entries(topicMap).map(([topic, stats]) => {
    const avgPct = Math.round((stats.totalScore / stats.totalQuestions) * 100);
    return { topic, avgPct, attempts: stats.attempts };
  });

  // Sort: worst topics first — so the user's attention goes where it's needed
  rows.sort((a, b) => a.avgPct - b.avgPct);

  // ── Step 3: Classify each topic into one of three statuses ──
  // WHY: Numbers alone don't give instant meaning. A coloured badge makes the
  // status obvious at a glance without reading a single number.
  const getStatus = (pct) => {
    if (pct >= 80) return { label: 'Mastered ✅',        className: styles.mastered };
    if (pct >= 50) return { label: 'Needs Practice ⚠️', className: styles.needsPractice };
    return             { label: 'Struggling ❌',         className: styles.struggling };
  };

  if (rows.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Topic Strength Breakdown</h3>
      <p className={styles.subtitle}>Sorted by weakest first — study these to level up fastest.</p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Topic</th>
              <th>Avg Score</th>
              {/* Progress bar column — WHY: visual percentage is faster to parse than a number */}
              <th>Progress</th>
              <th>Attempts</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ topic, avgPct, attempts }) => {
              const { label, className } = getStatus(avgPct);
              return (
                <tr key={topic}>
                  <td className={styles.topicCell}>{topic}</td>
                  <td className={styles.pctCell}>{avgPct}%</td>
                  <td className={styles.barCell}>
                    {/* A thin inline progress bar — gives instant visual comparison */}
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${avgPct}%`, background: avgPct >= 80 ? '#10b981' : avgPct >= 50 ? '#f59e0b' : '#ef4444' }}
                      />
                    </div>
                  </td>
                  <td className={styles.attemptsCell}>{attempts}</td>
                  <td><span className={`${styles.statusBadge} ${className}`}>{label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopicStrengthTable;
