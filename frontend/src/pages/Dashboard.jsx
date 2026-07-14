import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import styles from './Dashboard.module.css';
import axios from 'axios';
import { Bot } from 'lucide-react';
import { API_BASE_URL } from '../api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import ReactMarkdown from 'react-markdown';

const Dashboard = ({ theme, toggleTheme, onBotClick }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'progress');
  const [progressData, setProgressData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiReview, setAiReview] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
    setAiReview(""); 
  }, [activeTab, setSearchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'progress' ? '/quiz/my-progress' : '/analyze/my-history';
      const res = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      if (activeTab === 'progress') setProgressData(res.data);
      else setHistoryData(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAiReview = async () => {
    setReviewLoading(true);
    try {
      const endpoint = activeTab === 'progress' ? '/quiz/ai-review' : '/analyze/ai-review';
      const res = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      setAiReview(res.data.review);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 503) {
        setAiReview("The AI model is currently experiencing high demand. Please wait a moment and try again!");
      } else {
        setAiReview("Failed to fetch AI Review. Please try again.");
      }
    }
    setReviewLoading(false);
  };

  return (
    <>
      <Navbar onBotClick={onBotClick} currentTheme={theme} toggleTheme={toggleTheme} />
      <div className={styles.dashboardContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Your Dashboard</h1>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'progress' ? styles.active : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              Practice Progress
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'history' ? styles.active : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Analysis History
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.mainPanel}>
            {loading ? (
              <p className={styles.loading}>Loading your data...</p>
            ) : activeTab === 'progress' ? (
              <ProgressView data={progressData} />
            ) : (
              <HistoryView data={historyData} />
            )}
          </div>

          <div className={styles.aiPanel}>
             <h3 className={styles.aiTitle}><Bot size={40}/> AI Tutor Review</h3>
            <p className={styles.aiDesc}>
              Get personalized feedback based on your recent {activeTab === 'progress' ? 'quiz performance' : 'coding history'}.
            </p>
            <button className={styles.aiBtn} onClick={handleAiReview} disabled={reviewLoading}>
              {reviewLoading ? "Analyzing..." : "Generate Review"}
            </button>
            {aiReview && (
              <div className={styles.aiResponse}>
                <ReactMarkdown>{aiReview}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const ContributionHeatmap = ({ data, title }) => {
  const dateCounts = {};
  data.forEach(item => {
    if(item.createdAt) {
      const d = new Date(item.createdAt).toISOString().split('T')[0];
      dateCounts[d] = (dateCounts[d] || 0) + 1;
    }
  });

  const today = new Date();
  const days = [];
  for (let i = 125; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      count: dateCounts[dateStr] || 0
    });
  }

  return (
    <div className={styles.heatmapContainer}>
      <h4 className={styles.heatmapTitle}>{title}</h4>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className={styles.heatmapGrid}>
          {days.map((day, idx) => {
            let level = 0;
            if (day.count === 1) level = 1;
            else if (day.count === 2) level = 2;
            else if (day.count >= 3) level = 3;
            return (
              <div 
                key={idx} 
                className={`${styles.heatmapCell} ${level > 0 ? styles['heatmapLevel' + level] : ''}`}
                title={`${day.count} contributions on ${day.date}`}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ProgressView = ({ data }) => {
  if (data.length === 0) return <p className={styles.empty}>No quiz history found.</p>;
  
  const scoreData = data.map((d, i) => ({
    name: `Q${data.length - i}`,
    score: Math.round((d.score / d.totalQuestions) * 100)
  })).reverse();

  // Aggregate topics for Concept Grip Radar
  const topicGrip = {};
  data.forEach(item => {
    const t = item.topic && item.topic !== "Unknown" ? item.topic : "General";
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

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', height: 250, background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '20px', borderRadius: '8px' }}>
            <h4 style={{textAlign: 'center', marginBottom: '20px', color: 'var(--text)'}}>Recent Quiz Scores (%)</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <XAxis dataKey="name" stroke="var(--text)" />
                <YAxis stroke="var(--text)" />
                <Tooltip cursor={{fill: 'var(--bg)'}} contentStyle={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text)'}} />
                <Bar dataKey="score" fill="#0088FE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
        </div>

        <div style={{ flex: '1 1 300px', height: 250, background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '20px', borderRadius: '8px' }}>
            <h4 style={{textAlign: 'center', marginBottom: '20px', color: 'var(--text)'}}>Concept Grip (Radar)</h4>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                <PolarGrid stroke="var(--card-border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text)', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip contentStyle={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text)'}} />
              </RadarChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.list}>
        {data.map((item, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.cardHeader}>
              <h4 className={styles.cardTitle}>{item.topic}</h4>
              <span className={styles.score}>{item.score} / {item.totalQuestions}</span>
            </div>
            <div className={styles.cardMeta}>
              <span>{item.category} • <span style={{textTransform: 'capitalize'}}>{item.difficulty}</span></span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HistoryView = ({ data }) => {
  if (data.length === 0) return <p className={styles.empty}>No analysis history found.</p>;

  const filteredData = data.filter(item => {
    const isAnalyze = !item.actionType || item.actionType === 'analyze';
    const noErrors = !String(item.timeComplexity).toLowerCase().includes("error") &&
                     !String(item.timeComplexity).toLowerCase().includes("n/a") &&
                     !String(item.topic).toLowerCase().includes("error");
    return isAnalyze && noErrors;
  });

  if (filteredData.length === 0) return <p className={styles.empty}>No clean analysis history found.</p>;

  const topicCount = {};
  const complexityCount = {};
  const allMistakes = [];
  let recentLevel = "Unknown";
  
  filteredData.forEach((item, idx) => {
    const t = item.topic && item.topic !== "Unknown" ? item.topic : "General";
    const c = item.timeComplexity && item.timeComplexity !== "Unknown" ? item.timeComplexity : "N/A";
    
    topicCount[t] = (topicCount[t] || 0) + 1;
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
  allMistakes.forEach(m => {
    mistakeFrequencies[m] = (mistakeFrequencies[m] || 0) + 1;
  });
  const topMistakes = Object.entries(mistakeFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);

  const topicData = Object.keys(topicCount).map(key => ({ subject: key, A: topicCount[key], fullMark: Math.max(...Object.values(topicCount)) + 2 }));
  const complexityData = Object.keys(complexityCount).map(key => ({ name: key, count: complexityCount[key] }));
  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div>
      <ContributionHeatmap data={data} title="Coding Analysis Streak" />

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div className={styles.card} style={{ flex: '1 1 200px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text)', opacity: 0.8, marginBottom: '15px' }}>Current Coder Level</h3>
          <h1 style={{ fontSize: '3rem', color: 'var(--primary)', fontFamily: "'Playfair Display', serif", margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {recentLevel}
          </h1>
        </div>
        <div className={styles.card} style={{ flex: '2 1 400px' }}>
          <h3 style={{ color: 'var(--text)', opacity: 0.8, marginBottom: '15px' }}>Common Mistakes Log</h3>
          {topMistakes.length > 0 ? (
            <ul style={{ paddingLeft: '20px', color: 'var(--text)', lineHeight: '1.6' }}>
              {topMistakes.map((m, idx) => <li key={idx} style={{ marginBottom: '8px' }}>{m}</li>)}
            </ul>
          ) : (
             <p style={{ color: 'var(--text)', opacity: 0.7 }}>No common mistakes recorded yet! Keep coding cleanly!</p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', height: 250, background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '20px', borderRadius: '8px' }}>
          <h4 style={{textAlign: 'center', marginBottom: '20px', color: 'var(--text)'}}>Skill Radar</h4>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={topicData}>
              <PolarGrid stroke="var(--card-border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text)', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar name="Analyzed" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Tooltip contentStyle={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text)'}} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ flex: '1 1 300px', height: 250, background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '20px', borderRadius: '8px' }}>
          <h4 style={{textAlign: 'center', marginBottom: '20px', color: 'var(--text)'}}>Time Complexities Used</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={complexityData} margin={{ bottom: 40 }}>
              <XAxis 
                dataKey="name" 
                stroke="var(--text)" 
                tick={{ fontSize: 11, angle: -45, textAnchor: 'end' }} 
                interval={0}
              />
              <YAxis stroke="var(--text)" />
              <Tooltip cursor={{fill: 'var(--bg)'}} contentStyle={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text)'}} />
              <Bar dataKey="count" fill="#84cc16" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.list}>
        {filteredData.map((item, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.cardHeader}>
              <h4 className={styles.cardTitle}>
                {item.language} Code {item.topic && `(${item.topic})`}
              </h4>
              <span className={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div className={styles.complexities}>
              <div className={styles.badge}>⏱ {item.timeComplexity}</div>
              <div className={styles.badge}>💾 {item.spaceComplexity}</div>
              {item.difficulty && item.difficulty !== 'Unknown' && (
                <div className={styles.badge} style={{background: 'var(--primary)', color: '#fff'}}>⭐ {item.difficulty}</div>
              )}
            </div>
            
            {item.mistakes && item.mistakes.length > 0 && (
              <div style={{ marginTop: '15px', color: 'var(--text)' }}>
                <strong style={{ opacity: 0.8 }}>Mistakes Found:</strong>
                <ul style={{ margin: '5px 0 0 20px', opacity: 0.9, fontSize: '0.95rem' }}>
                  {item.mistakes.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
