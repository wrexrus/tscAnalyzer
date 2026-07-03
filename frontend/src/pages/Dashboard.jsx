import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import styles from './Dashboard.module.css';
import axios from 'axios';
import { Bot } from 'lucide-react';
import { API_BASE_URL } from '../api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
                {aiReview}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const ProgressView = ({ data }) => {
  if (data.length === 0) return <p className={styles.empty}>No quiz history found.</p>;
  
  const scoreData = data.map((d, i) => ({
    name: `Q${data.length - i}`,
    score: Math.round((d.score / d.totalQuestions) * 100)
  })).reverse();

  return (
    <div>
      <div style={{ width: '100%', height: 250, background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
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

  const topicCount = {};
  const complexityCount = {};

  data.forEach(item => {
    const t = item.topic && item.topic !== "Unknown" ? item.topic : "General";
    const c = item.timeComplexity && item.timeComplexity !== "Unknown" ? item.timeComplexity : "N/A";
    topicCount[t] = (topicCount[t] || 0) + 1;
    complexityCount[c] = (complexityCount[c] || 0) + 1;
  });

  const topicData = Object.keys(topicCount).map(key => ({ name: key, value: topicCount[key] }));
  const complexityData = Object.keys(complexityCount).map(key => ({ name: key, count: complexityCount[key] }));
  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', height: 250, background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '20px', borderRadius: '8px' }}>
          <h4 style={{textAlign: 'center', marginBottom: '20px', color: 'var(--text)'}}>Code Topics Evaluated</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={topicData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                {topicData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text)'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ flex: '1 1 300px', height: 250, background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '20px', borderRadius: '8px' }}>
          <h4 style={{textAlign: 'center', marginBottom: '20px', color: 'var(--text)'}}>Time Complexities Used</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={complexityData}>
              <XAxis dataKey="name" stroke="var(--text)" />
              <YAxis stroke="var(--text)" />
              <Tooltip cursor={{fill: 'var(--bg)'}} contentStyle={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text)'}} />
              <Bar dataKey="count" fill="#84cc16" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.list}>
        {data.map((item, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.cardHeader}>
              <h4 className={styles.cardTitle}>{item.language} Code {item.topic && `(${item.topic})`}</h4>
              <span className={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <div className={styles.complexities}>
              <div className={styles.badge}>⏱ {item.timeComplexity}</div>
              <div className={styles.badge}>💾 {item.spaceComplexity}</div>
              {item.difficulty && item.difficulty !== 'Unknown' && (
                <div className={styles.badge} style={{background: 'var(--primary)', color: '#fff'}}>⭐ {item.difficulty}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
