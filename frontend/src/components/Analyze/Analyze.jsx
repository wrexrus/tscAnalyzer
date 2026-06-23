import React, { useState, useEffect } from 'react';
import ComplexityGraph from "../ComplexityGraph";  
import styles from "./Analyze.module.css";

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

const Analyze = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const onAuthChange = () => setIsLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', onAuthChange);
    window.addEventListener('authChanged', onAuthChange);
    return () => {
      window.removeEventListener('storage', onAuthChange);
      window.removeEventListener('authChanged', onAuthChange);
    };
  }, []);

  const handleAnalyze = async () => {
    if (!code.trim()){
       alert("No code provided");
       return;
    }
    setLoading(true);
    setProgress(8);

    let id = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 12 + 6, 92));
    }, 250);

    try {
      const res = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 503) {
          alert(data.error || "The AI model is currently experiencing high demand. Please wait a moment and try again!");
        } else {
          alert(data.error || "Server error. Check console.");
        }
        return;
      }
      
      setResult(data);
      setShowResult(true);
      setProgress(100);
    } catch (err) {
      alert("Network error. Check console.");
      console.error(err);
    } finally {
      clearInterval(id);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 350);
    }
  };

  const handleReset = () => {
    setCode('');
    setResult(null);
    setShowResult(false);
  };

  return (
    <section id="analyze" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Analyze Code</h1>
          
          {!isLoggedIn && (
            <div style={{ textAlign: "center", marginBottom: "20px", color: "red", opacity: 0.7, fontStyle: "italic", fontSize: "1.1rem" }}>
              * Do login to Save Report
            </div>
          )}

          {!showResult ? (
            <>
              <div className={styles.inputWrapper}>
                <textarea
                  className={styles.textarea}
                  placeholder="Drop your code!"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button
                  className={`${styles.analyzeBtn} ${loading ? styles.analyzeBtnDisabled : ''}`}
                  onClick={handleAnalyze}
                  disabled={loading}
                  aria-busy={loading}
                  aria-live="polite"
                >
                  {loading && (
                    <span
                      className={styles.progressFill}
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  <span className={styles.btnLabel}>
                    {loading ? "Analyzing…" : "Analyze"}
                  </span>
                </button>
              </div>
              
              {isLoggedIn && (
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
                  <button 
                    className={styles.resetBtn}
                    style={{ padding: "8px 16px", fontSize: "0.9rem", background: "transparent", border: "1px solid var(--card-border)" }}
                    onClick={() => alert("Previous analysis feature coming soon!")}
                  >
                    Previous analysis
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.resultWrapper}>
              <div className={styles.codeBox}>
                <h4 className={styles.panelTitle}>💻 Your Code</h4>
                <pre className={styles.codePreview}>{code}</pre>
              </div>

              <div className={styles.graphBox}>
                <h4 className={styles.panelTitle}>📊 Complexity Explanation</h4>
                <p className={styles.explanation}>{result?.explanation}</p>
                <ComplexityGraph explanation={result?.explanation} />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button className={styles.resetBtn} onClick={handleReset} style={{ flex: 1 }}>
                  Test New Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Analyze;