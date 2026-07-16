import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './HistoryCard.module.css';
import { Clock4,Save,Star,Brain } from 'lucide-react';

const HistoryCard = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const difficultyColor = {
    Easy: '#10b981',    
    Medium: '#f59e0b',  
    Hard: '#ef4444',    
  }[item.difficulty] || 'var(--primary)';

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h4 className={styles.cardTitle}>
          {item.language} Code {item.topic && <span className={styles.topicChip}>{item.topic}</span>}
        </h4>
        <span className={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>

      <div className={styles.badges}>
        <span className={styles.badge}><Clock4 /> {item.timeComplexity}</span>
        <span className={styles.badge}><Save /> {item.spaceComplexity}</span>
        {item.difficulty && item.difficulty !== 'Unknown' && (
          <span className={styles.badge} style={{ background: difficultyColor, color: '#fff' }}>
            <Star /> {item.difficulty}
          </span>
        )}
        {item.developerLevel && item.developerLevel !== 'Unknown' && (
          <span className={styles.badge}><Brain /> {item.developerLevel}</span>
        )}
      </div>

      {item.mistakes && item.mistakes.length > 0 && (
        <div className={styles.mistakesSection}>
          <strong>Mistakes Found:</strong>
          <ul className={styles.mistakesList}>
            {item.mistakes.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      {item.explanation && (
        <button
          className={styles.toggleBtn}
          onClick={() => setIsExpanded(prev => !prev)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? '▲ Hide Full Analysis' : '▼ View Full Analysis'}
        </button>
      )}

     {isExpanded && item.explanation && (
        <div className={styles.expandedContent}>
          <ReactMarkdown>{item.explanation}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default HistoryCard;
