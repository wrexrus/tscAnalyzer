/*
 Dashboard.jsx  — Orchestrator 
 
   ORCHESTRATOR:
  work:
    Fetch data from the backend.
    Manage top-level state (which tab is active, AI review text).
    Pass that data down to "view" sub-components.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import styles from './Dashboard.module.css';
import axios from 'axios';
import { Bot } from 'lucide-react';
import { API_BASE_URL } from '../api';
import ReactMarkdown from 'react-markdown';

import ProgressView from '../components/Dashboard/ProgressView';
import HistoryView  from '../components/Dashboard/HistoryView';

const Dashboard = ({ theme, toggleTheme, onBotClick }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab,     setActiveTab]     = useState(searchParams.get('tab') || 'progress');
  const [progressData,  setProgressData]  = useState([]);
  const [historyData,   setHistoryData]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [aiReview,      setAiReview]      = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    setSearchParams({ tab: activeTab });
    setAiReview('');
    fetchData();
  }, [activeTab]);

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
      console.error('Dashboard fetchData error:', err);
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
      console.error('AI review error:', err);
      if (err.response?.status === 503) {
        setAiReview('The AI model is currently experiencing high demand. Please wait a moment and try again!');
      } else {
        setAiReview('Failed to fetch AI Review. Please try again.');
      }
    }
    setReviewLoading(false);
  };

  return (
    <>
      <Navbar onBotClick={onBotClick} currentTheme={theme} toggleTheme={toggleTheme} />
      <div className={styles.dashboardContainer}>

        {/* Header + Tab Switcher */}
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

        {/*data panel + AI sidebar */}
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

          {/*  AI Tutor Sidebar  */}
          <div className={styles.aiPanel}>
            <h3 className={styles.aiTitle}><Bot size={22} style={{ flexShrink: 0 }} /> AI Tutor Review</h3>
            <p className={styles.aiDesc}>
              Get personalized feedback based on your recent {activeTab === 'progress' ? 'quiz performance' : 'coding history'}.
            </p>
            <button className={styles.aiBtn} onClick={handleAiReview} disabled={reviewLoading}>
              {reviewLoading ? 'Analyzing...' : 'Generate Review'}
            </button>

            {/* ReactMarkdown renders the structured markdown */}
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

export default Dashboard;
