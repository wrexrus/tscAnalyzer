import React, { useState, useEffect, useRef } from 'react';
import ComplexityGraph from "../ComplexityGraph";  
import styles from "./Analyze.module.css";
import { API_BASE_URL } from "../../api";
import { handleError } from "../../pages/utils";

const Analyze = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const resultRef = useRef(null);

  useEffect(() => {
    const onAuthChange = () => setIsLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', onAuthChange);
    window.addEventListener('authChanged', onAuthChange);
    return () => {
      window.removeEventListener('storage', onAuthChange);
      window.removeEventListener('authChanged', onAuthChange);
    };
  }, []);

  useEffect(() => {
    if (showResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showResult]);

  const handleAnalyze = async () => {
    if (!code.trim()){
       handleError("No code provided");
       return;
    }
    setLoading(true);
    setProgress(8);

    let id = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 12 + 6, 92));
    }, 250);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": token } : {})
        },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        if (res.status === 503) {
          handleError("The AI model is currently experiencing high demand. Please wait a moment and try again!");
        } else {
          handleError("Server error. Check console.");
        }
        return;
      }
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let analysisText = "";
      let buffer = "";

      setShowResult(true);
      setResult({ explanation: "" });

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop();
          
          for (const part of parts) {
            const lines = part.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr === '[DONE]') {
                  done = true;
                  break;
                }
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.text) {
                    for (const char of parsed.text) {
                      analysisText += char;
                      setResult({ explanation: analysisText });
                      await new Promise(r => setTimeout(r, 10)); // Typewriter effect
                    }
                  }
                } catch (e) {}
              }
            }
          }
        }
      }
      
      setProgress(100);
    } catch (err) {
      handleError("Network error. Check console.");
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

  const isErrorFallback = result?.explanation?.startsWith("Error:");

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
                    className={styles.analyzeBtn}
                    onClick={() => window.location.href = '/dashboard?tab=history'}
                  >
                    Previous analysis
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.resultWrapper} ref={resultRef}>
              <div className={styles.codeBox}>
                <h4 className={styles.panelTitle}>Your Code</h4>
                <pre className={styles.codePreview}>{code}</pre>
              </div>

              <div className={styles.graphBox}>
                <h4 className={styles.panelTitle}>
                  {isErrorFallback ? "Code Error" : "Complexity Explanation"}
                </h4>
                <p className={styles.explanation} style={{ whiteSpace: 'pre-wrap', color: isErrorFallback ? '#ff4d4f' : 'inherit' }}>
                  {result?.explanation}
                </p>
                {!isErrorFallback && <ComplexityGraph explanation={result?.explanation} />}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button 
                  className={styles.resetBtn} 
                  onClick={handleReset} 
                  style={{ flex: 1, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                  disabled={loading}
                >
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