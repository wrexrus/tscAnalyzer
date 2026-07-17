/* Easy   quiz: score% × 10 XP  (max 10 per question answered)
  Medium quiz: score% × 20 XP
  Hard   quiz: score% × 35 XP */

import React from 'react';
import styles from './XpBadgePanel.module.css';
import { Target,Flame,BicepsFlexed,BowArrow,GraduationCap,Crown,Telescope,HatGlasses,TrendingUp,Dices,LockKeyhole,Trophy  } from 'lucide-react';

const XP_MULTIPLIER = { Easy: 10, Medium: 20, Hard: 35 };

const calcXp = (item) => {
  const pct        = item.score / item.totalQuestions;               // 0 to 1
  const multiplier = XP_MULTIPLIER[item.difficulty] ?? 10;           // fallback to Easy
  return Math.round(pct * multiplier * item.totalQuestions);         // scale by Qs answered
};


// Each badge is an object with:
//   id       — unique key
//   emoji    — displayed on the badge card
//   name     — badge title
//   desc     — what the user did to earn it
//   unlocked — function(data) => boolean: true if the user has earned this badge

const BADGE_DEFINITIONS = [
  {
    id: 'first_blood',
    emoji: <Target />,
    name: 'First Blood',
    desc: 'Complete your very first quiz.',
    unlocked: (data) => data.length >= 1,
  },
  {
    id: 'consistent',
    emoji: <Flame />,
    name: 'On a Streak',
    desc: 'Complete 5 or more quizzes.',
    unlocked: (data) => data.length >= 5,
  },
  {
    id: 'dedicated',
    emoji: <BicepsFlexed />,
    name: 'Dedicated',
    desc: 'Complete 20 or more quizzes.',
    unlocked: (data) => data.length >= 20,
  },
  {
    id: 'perfectionist',
    emoji: <BowArrow />,
    name: 'Perfectionist',
    desc: 'Score 100% on any quiz.',
    unlocked: (data) => data.some(d => d.score === d.totalQuestions),
  },
  {
    id: 'graph_master',
    emoji: <GraduationCap />,
    name: 'Graph Master',
    desc: 'Score ≥ 80% on a Graphs quiz.',
    unlocked: (data) => data.some(d =>
      d.topic?.toLowerCase().includes('graph') &&
      (d.score / d.totalQuestions) >= 0.8
    ),
  },
  {
    id: 'o1_legend',
    emoji: <Crown />,
    name: 'O(1) Legend',
    desc: 'Score 100% on a Hard quiz.',
    unlocked: (data) => data.some(d => d.difficulty === 'Hard' && d.score === d.totalQuestions),
  },
  {
    id: 'explorer',
    emoji: <Telescope />,
    name: 'Explorer',
    desc: 'Practice 3 or more different topics.',
    unlocked: (data) => {
      const topics = new Set(data.map(d => d.topic).filter(Boolean));
      return topics.size >= 3;
    },
  },
  {
    id: 'polymath',
    emoji: <Dices />,
    name: 'Polymath',
    desc: 'Practice 6 or more different topics.',
    unlocked: (data) => {
      const topics = new Set(data.map(d => d.topic).filter(Boolean));
      return topics.size >= 6;
    },
  },
  {
    id: 'comeback',
    emoji: <TrendingUp />,
    name: 'Comeback Kid',
    desc: 'Beat your previous score on the same topic.',
    unlocked: (data) => {
      const topicScores = {};
      const sorted = [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      for (const item of sorted) {
        const t = item.topic || 'General';
        const pct = item.score / item.totalQuestions;
        if (topicScores[t] !== undefined && pct > topicScores[t]) return true;
        topicScores[t] = pct;
      }
      return false;
    },
  },
  {
    id: 'hard_hitter',
    emoji: <HatGlasses />,
    name: 'Hard Hitter',
    desc: 'Complete 3 Hard difficulty quizzes.',
    unlocked: (data) => data.filter(d => d.difficulty === 'Hard').length >= 3,
  },
];


const LEVELS = [
  { name: 'Novice',       minXp: 0    },
  { name: 'Apprentice',   minXp: 100  },
  { name: 'Developer',    minXp: 300  },
  { name: 'Engineer',     minXp: 600  },
  { name: 'Senior',       minXp: 1000 },
  { name: 'Architect',    minXp: 1500 },
  { name: 'Legend',       minXp: 2500 },
];

const getLevel = (xp) => {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXp) level = l;
  }
  return level;
};

const getNextLevel = (xp) => {
  for (const l of LEVELS) {
    if (xp < l.minXp) return l;
  }
  return null; // already max level
};

const XpBadgePanel = ({ data }) => {
  const totalXp = data.reduce((sum, item) => sum + calcXp(item), 0);

  const currentLevel = getLevel(totalXp);
  const nextLevel    = getNextLevel(totalXp);

  const progressPct = nextLevel
    ? Math.round(((totalXp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100)
    : 100;

  // ── Evaluate each badge ──
  const badges = BADGE_DEFINITIONS.map(badge => ({
    ...badge,
    earned: badge.unlocked(data),
  }));

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div className={styles.wrapper}>
      {/* ── XP & Level section ── */}
      <div className={styles.xpSection}>
        <div className={styles.xpLeft}>
          <span className={styles.levelLabel}>Level</span>
          <span className={styles.levelName}>{currentLevel.name}</span>
        </div>

        <div className={styles.xpRight}>
          <div className={styles.xpCount}>{totalXp.toLocaleString()} XP</div>
          {nextLevel && (
            <p className={styles.xpSubtext}>
              {nextLevel.minXp - totalXp} XP to <strong>{nextLevel.name}</strong>
            </p>
          )}
          {!nextLevel && (
            <p className={styles.xpSubtext}><Trophy /> Maximum level reached!</p>
          )}

          {/* Level progress bar */}
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* ── Badges grid ── */}
      <div className={styles.badgesHeader}>
        <h4 className={styles.badgesTitle}>Badges</h4>
        <span className={styles.badgesCount}>{earnedCount} / {badges.length} earned</span>
      </div>

      <div className={styles.badgesGrid}>
        {badges.map(badge => (
          <div
            key={badge.id}
            className={`${styles.badgeCard} ${badge.earned ? styles.earned : styles.locked}`}
            title={badge.desc}
          >
            <span className={styles.badgeEmoji}>{badge.earned ? badge.emoji : <LockKeyhole />}</span>
            <span className={styles.badgeName}>{badge.name}</span>
            <span className={styles.badgeDesc}>{badge.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default XpBadgePanel;
