import { useState } from 'react';
import ComplexityGraph from "../ComplexityGraph";  
import styles from "./Analyze.module.css";

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

const Analyze = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

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
      setResult(data);
      setShowResult(true);
      setProgress(100);
    } catch (err) {
      alert("Server error. Check console.");
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

          {!showResult ? (
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

              <button className={styles.resetBtn} onClick={handleReset}>
                Test New Code
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Analyze;