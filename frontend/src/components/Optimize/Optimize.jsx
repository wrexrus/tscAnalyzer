import React, { useState, useEffect, useRef } from 'react';
import styles from "./Optimize.module.css";
import { API_BASE_URL } from "../../api";
import { handleError } from "../../pages/utils";

const Optimize = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [isCodeMaximized, setIsCodeMaximized] = useState(false);
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

  const handleOptimize = async () => {
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
      const res = await fetch(`${API_BASE_URL}/optimize`, {
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
    setIsCodeMaximized(false);
  };

  const isErrorFallback = result?.explanation?.startsWith("Error:");

  return (
    <section id="optimize" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Optimize Code</h1>
          
          <div style={{ textAlign: "center", marginBottom: "20px", color: "var(--text)", opacity: 0.7, fontSize: "1.1rem" }}>
            Identify bugs and get AI-optimized pseudo-code!
          </div>

          {!showResult ? (
            <>
              <div className={styles.inputWrapper}>
                <textarea
                  className={styles.textarea}
                  placeholder="Drop your unoptimized or buggy code here!"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button
                  className={`${styles.analyzeBtn} ${loading ? styles.analyzeBtnDisabled : ''}`}
                  onClick={handleOptimize}
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
                    {loading ? "Optimizing…" : "Optimize"}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className={styles.resultWrapper} ref={resultRef}>
              <div className={styles.codeBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px', marginBottom: '15px' }}>
                  <h4 className={styles.panelTitle} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>Original Code</h4>
                  <button onClick={() => setIsCodeMaximized(!isCodeMaximized)} className={styles.toggleBtn}>
                    {isCodeMaximized ? 'Minimize' : 'Maximize'}
                  </button>
                </div>
                <pre className={`${styles.codePreview} ${isCodeMaximized ? styles.maximized : styles.minimized}`}>{code}</pre>
              </div>

              <div className={styles.graphBox} style={{ marginTop: '20px' }}>
                <h4 className={styles.panelTitle}>
                  {isErrorFallback ? "Code Error" : "Optimization Results"}
                </h4>
                
                {/* Use a pre block to perfectly preserve pseudocode indentations and formatting */}
                <pre 
                   className={styles.codePreview} 
                   style={{ 
                     whiteSpace: 'pre-wrap', 
                     color: isErrorFallback ? '#ff4d4f' : 'inherit',
                     fontFamily: 'inherit',
                     fontSize: '15px',
                     border: 'none',
                     padding: '0'
                   }}
                >
                  {result?.explanation}
                </pre>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
                <button 
                  className={styles.resetBtn} 
                  onClick={handleReset} 
                  style={{ flex: 1, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                  disabled={loading}
                >
                  Optimize New Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Optimize;
