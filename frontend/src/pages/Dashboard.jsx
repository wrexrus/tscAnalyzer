import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import styles from './Dashboard.module.css';
import axios from 'axios';
import { Bot } from 'lucide-react';
import { API_BASE_URL } from '../api';

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
  return (
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
  );
};

const HistoryView = ({ data }) => {
  if (data.length === 0) return <p className={styles.empty}>No analysis history found.</p>;
  return (
    <div className={styles.list}>
      {data.map((item, idx) => (
        <div key={idx} className={styles.card}>
          <div className={styles.cardHeader}>
            <h4 className={styles.cardTitle}>{item.language} Code</h4>
            <span className={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
          <div className={styles.complexities}>
            <div className={styles.badge}>⏱ {item.timeComplexity}</div>
            <div className={styles.badge}>💾 {item.spaceComplexity}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
