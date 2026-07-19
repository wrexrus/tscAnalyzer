

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';
import styles from './LearningRoadmap.module.css';
import { Laptop,BookOpenText,Dumbbell,Lightbulb,Zap,NotebookPen,Goal,TriangleAlert,BadgeInfo,TrendingDown,ChartColumn,ClipboardList,RefreshCw,Sparkles,X,ChevronDown,ChevronUp } from 'lucide-react';

const FOCUS_CONFIG = {
  theory:   { label: 'Theory Day',   icon:  <BookOpenText />, className: 'focusTheory'   },
  code:     { label: 'Coding Day',   icon: <Laptop />, className: 'focusCode'     },
  practice: { label: 'Practice Day', icon: <Dumbbell />, className: 'focusPractice' },
};

const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonDay} />
    <div className={styles.skeletonLine} style={{ width: '60%' }} />
    <div className={styles.skeletonLine} style={{ width: '90%' }} />
    <div className={styles.skeletonLine} style={{ width: '75%' }} />
  </div>
);

const DayCard = ({ item, onClick }) => {
  const config = FOCUS_CONFIG[item.focus] || FOCUS_CONFIG.theory;

  return (
    <div
      className={`${styles.dayCard} ${styles[config.className]}`}
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(item)}
      title="Click to read in full"
    >
      <div className={styles.dayBadge}>Day {item.day}</div>
      <span className={styles.focusChip}>{config.icon} {config.label}</span>
      <h4 className={styles.dayTopic}>{item.topic}</h4>
      <p className={styles.dayWhy}><strong>Why:</strong> {item.why}</p>
      <div className={styles.taskBox}>
        <span className={styles.taskLabel}>Today's Task</span>
        <p className={styles.taskText}>{item.task}</p>
      </div>
      {item.practiceHint   && <p className={styles.hint}><Lightbulb /> {item.practiceHint}</p>}
      {item.complexityGoal && <p className={styles.complexity}><Zap /> {item.complexityGoal}</p>}

      <span className={styles.expandHint}>Click to expand ↗</span>
    </div>
  );
};

// full-screen overlay with backdrop blur showing one day's full details
// useEffect for keydown, lets user close modal with Escape key 
const DayModal = ({ item, onClose }) => {
  const config = FOCUS_CONFIG[item.focus] || FOCUS_CONFIG.theory;

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={`${styles.modalBox} ${styles[config.className]}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>

        <div className={styles.modalHeader}>
          <div className={styles.dayBadge} style={{ fontSize: '1rem' }}>Day {item.day}</div>
          <span className={`${styles.focusChip} ${styles.focusChipLarge}`}>
            {config.icon} {config.label}
          </span>
        </div>

        <h2 className={styles.modalTopic}>{item.topic}</h2>

        {/* Why this topic */}
        <div className={styles.modalSection}>
          <span className={styles.modalSectionLabel}><Goal /> Why This Topic</span>
          <p className={styles.modalSectionText}>{item.why}</p>
        </div>

        {/* Task */}
        <div className={styles.modalSection}>
          <span className={styles.modalSectionLabel}><NotebookPen /> Today's Task</span>
          <p className={styles.modalSectionText}>{item.task}</p>
        </div>

        {/* Practice hint */}
        {item.practiceHint && (
          <div className={styles.modalSection}>
            <span className={styles.modalSectionLabel}><Lightbulb /> Where to Practice</span>
            <p className={styles.modalSectionText}>{item.practiceHint}</p>
          </div>
        )}

        {/* Complexity goal */}
        {item.complexityGoal && (
          <div className={styles.modalSection}>
            <span className={styles.modalSectionLabel}><Zap /> Complexity Goal</span>
            <p className={styles.modalSectionText}>{item.complexityGoal}</p>
          </div>
        )}

        <p className={styles.modalEscHint}>Press Esc or click outside to close</p>
      </div>
    </div>
  );
};

// ── Transparency panel ──
const DataUsedPanel = ({ dataUsed }) => (
  <div className={styles.dataPanel}>
    <p className={styles.dataPanelTitle}><BadgeInfo /> This roadmap was built from your personal data:</p>
    <ul className={styles.dataList}>
      <li><ChartColumn /> <strong>{dataUsed.quizSessions}</strong> quiz session{dataUsed.quizSessions !== 1 ? 's' : ''}</li>
      <li><Laptop /> <strong>{dataUsed.codeSessions}</strong> code analysis/optimize session{dataUsed.codeSessions !== 1 ? 's' : ''}</li>
      {dataUsed.weakestTopics?.length > 0 && (
        <li><TrendingDown /> Weakest quiz topics: <strong>{dataUsed.weakestTopics.join(', ')}</strong></li>
      )}
      {dataUsed.topMistakes?.length > 0 && (
        <li><TriangleAlert /> Recurring mistakes: <strong>{dataUsed.topMistakes.slice(0, 3).join(', ')}</strong></li>
      )}
    </ul>
  </div>
);

// Main Component
const LearningRoadmap = ({ data }) => {
  const [roadmap,     setRoadmap]     = useState(null);   // null = not yet generated
  const [dataUsed,    setDataUsed]    = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  
  const [isVisible,   setIsVisible]   = useState(true);

  // selectedDay drives the modal — null means no modal shown
  const [selectedDay, setSelectedDay] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError('');
    setRoadmap(null);
    setDataUsed(null);
    setIsVisible(true); // reopen if user had closed it

    try {
      const res = await axios.get(`${API_BASE_URL}/quiz/learning-roadmap`, {
        headers: { Authorization: localStorage.getItem('token') }
      });

      if (res.data.message) {
        setError(res.data.message);
      } else {
        setRoadmap(res.data.roadmap);
        setDataUsed(res.data.dataUsed);
      }
    } catch (err) {
      console.error('Roadmap generation error:', err);
      setError(err.response?.data?.error || 'Failed to generate roadmap. Please try again.');
    }

    setLoading(false);
  };

  return (
    <>
      {selectedDay && (
        <DayModal item={selectedDay} onClose={() => setSelectedDay(null)} />
      )}

      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}><BookOpenText/>Your 7-Day Learning Roadmap</h3>
            <p className={styles.subtitle}>
              AI builds a personalised plan from your code mistakes and quiz performance.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.generateBtn} onClick={generate} disabled={loading}>
              {loading ? (
                <>Generating...</>
              ) : roadmap ? (
                <><RefreshCw size={18} /> Regenerate</>
              ) : (
                <><Sparkles size={18} /> Generate My Roadmap</>
              )}
            </button>

            {roadmap && !loading && (
              <button
                className={styles.toggleBtn}
                onClick={() => setIsVisible(v => !v)}
                title={isVisible ? 'Minimise roadmap' : 'Show roadmap'}
              >
                {isVisible ? <><X size={18} /> Close</> : <><ChevronDown size={18} /> Show Roadmap</>}
              </button>
            )}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {loading && (
          <div className={styles.grid}>
            {Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {isVisible && !loading && (
          <>
            {dataUsed && <DataUsedPanel dataUsed={dataUsed} />}

            {roadmap && (
              <div className={styles.grid}>
                {roadmap.map(item => (
                  <DayCard
                    key={item.day}
                    item={item}
                    onClick={setSelectedDay}  // pass setter directly as callback
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default LearningRoadmap;
