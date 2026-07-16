/**
 * Props:
 *   data  — array of records with a `createdAt` timestamp
 *   title — heading text above the grid
 */

import React from 'react';
import styles from '../../pages/Dashboard.module.css';

const ContributionHeatmap = ({ data, title }) => {
  const dateCounts = {};
  data.forEach(item => {
    if (item.createdAt) {
      const d = new Date(item.createdAt).toISOString().split('T')[0];
      dateCounts[d] = (dateCounts[d] || 0) + 1;
    }
  });

  // last 126 days as an ordered array 
  const today = new Date();
  const days = [];
  for (let i = 125; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({ date: dateStr, count: dateCounts[dateStr] || 0 });
  }

  return (
    <div className={styles.heatmapContainer}>
      <h4 className={styles.heatmapTitle}>{title}</h4>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className={styles.heatmapGrid}>
          {days.map((day, idx) => {
            // Map count - level (0 = empty grey, 1–3 = increasingly bright)
            let level = 0;
            if (day.count === 1)    level = 1;
            else if (day.count === 2) level = 2;
            else if (day.count >= 3)  level = 3;

            return (
              <div
                key={idx}
                className={`${styles.heatmapCell} ${level > 0 ? styles['heatmapLevel' + level] : ''}`}
                title={`${day.count} contribution${day.count !== 1 ? 's' : ''} on ${day.date}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContributionHeatmap;
