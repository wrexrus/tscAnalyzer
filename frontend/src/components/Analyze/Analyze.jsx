import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import ComplexityGraph from "../ComplexityGraph";  
import AstVisualizer from "../AstVisualizer/AstVisualizer";
import ActionToolbar from "./ActionToolbar";
import styles from "./Analyze.module.css";
import { API_BASE_URL } from "../../api";
import { handleError } from "../../pages/utils";

const Analyze = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentMode, setCurrentMode] = useState('analyze'); // tracks which btn was clicked
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [isCodeMaximized, setIsCodeMaximized] = useState(false);
  const [astGraph, setAstGraph] = useState(null);
  const [activeTab, setActiveTab] = useState('explanation');
  const [mode, setMode] = useState('analyze');
  const [targetLanguage, setTargetLanguage] = useState('Python');
  const resultRef = useRef(null);
  const navigate = useNavigate();

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

  const handleAnalyze = async (selectedMode = 'analyze', customLang = null) => {
    if (!code.trim()){
       handleError("No code provided");
       return;
    }
    const finalLang = customLang || targetLanguage;
    setCurrentMode(selectedMode);
    setLoading(true);
    setIsStreaming(false);
    setResult(null);
    setShowResult(true); // show skeleton immediately on click
    setActiveTab('explanation');
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
        body: JSON.stringify({ code, mode: selectedMode, targetLanguage: finalLang }),
      });
      if (!res.ok) {
        if (res.status === 503) {
          handleError("The AI model is currently experiencing high demand. Please wait a moment and try again!");
        } else {
          handleError("Server error. Check console.");
        }
        return;
      }
      if (selectedMode === 'analyze') {
        fetch(`${API_BASE_URL}/ast`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code })
        }).then(r => r.json()).then(data => {
          if (!data.error) setAstGraph(data);
        }).catch(e => console.log("AST fetch failed or not JS/TS"));
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let analysisText = "";
      let buffer = "";

      setShowResult(true);
      setResult({ explanation: "" });
      setIsStreaming(true);

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
                    analysisText += parsed.text;
                    setResult({ explanation: analysisText });
                  }
                } catch (e) {}
              }
            }
          }
        }
      }
      
    } catch (err) {
      handleError("Network error. Check console.");
      console.error(err);
    } finally {
      clearInterval(id);
      setProgress(100);
      setLoading(false);
      setIsStreaming(false);
      setTimeout(() => setProgress(0), 350);
    }
  };

  const handleReset = () => {
    setCode('');
    setResult(null);
    setShowResult(false);
    setIsCodeMaximized(false);
    setAstGraph(null);
    setActiveTab('explanation');
    setIsStreaming(false);
    setCurrentMode('analyze');
  };

  const modeLabel = {
    analyze: 'Analyzing your code',
    optimize: 'Optimizing your code',
    convert: `Converting to ${targetLanguage}`,
    test: 'Generating knowledge test',
  };

  const isErrorFallback = result?.explanation?.startsWith("Error:");

  return (
    <section id="analyze" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Unified Code Engine</h1>
          
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
                  style={{ minHeight: '200px' }}
                />
                
                <ActionToolbar 
                  code={code}
                  mode={mode}
                  setMode={setMode}
                  targetLanguage={targetLanguage}
                  setTargetLanguage={setTargetLanguage}
                  onAction={handleAnalyze}
                  loading={loading}
                  progress={progress}
                />
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px', marginBottom: '15px' }}>
                  <h4 className={styles.panelTitle} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>Your Code</h4>
                  <button onClick={() => setIsCodeMaximized(!isCodeMaximized)} className={styles.toggleBtn}>
                    {isCodeMaximized ? 'Minimize' : 'Maximize'}
                  </button>
                </div>
                <pre className={`${styles.codePreview} ${isCodeMaximized ? styles.maximized : styles.minimized}`}>{code}</pre>
              </div>

              <div className={styles.graphBox}>
                <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--card-border)', marginBottom: '20px' }}>
                  <h4 
                    onClick={() => setActiveTab('explanation')} 
                    style={{ cursor: 'pointer', paddingBottom: '10px', color: activeTab === 'explanation' ? 'var(--primary)' : 'var(--text)', borderBottom: activeTab === 'explanation' ? '2px solid var(--primary)' : 'none' }}
                  >
                    {isErrorFallback ? "Code Error" : "Unified Explanation"}
                  </h4>
                  {currentMode === 'analyze' && (
                    <h4 
                      onClick={() => setActiveTab('ast')} 
                      style={{ cursor: 'pointer', paddingBottom: '10px', color: activeTab === 'ast' ? 'var(--primary)' : 'var(--text)', borderBottom: activeTab === 'ast' ? '2px solid var(--primary)' : 'none' }}
                    >
                      Compiler AST Graph
                    </h4>
                  )}
                </div>

                {/* Processing skeleton shown immediately on click */}
                {loading && !result?.explanation && (
                  <div className={styles.processingBox}>
                    <div className={styles.processingSpinner} />
                    <p className={styles.processingLabel}>{modeLabel[currentMode]}...</p>
                    <div className={styles.skeletonBar} style={{ width: '80%' }} />
                    <div className={styles.skeletonBar} style={{ width: '60%' }} />
                    <div className={styles.skeletonBar} style={{ width: '70%' }} />
                  </div>
                )}

                {activeTab === 'explanation' && result?.explanation ? (
                  <>
                    <div className={`${styles.markdownResult} ${isErrorFallback ? styles.errorResult : ''}`}>
                      <ReactMarkdown>{result.explanation}</ReactMarkdown>
                      {isStreaming && <span className={styles.streamingCursor}>▋</span>}
                    </div>
                    {!isErrorFallback && currentMode === 'analyze' && <ComplexityGraph explanation={result?.explanation} />}
                  </>
                ) : activeTab === 'ast' ? (
                  <>
                    {astGraph ? (
                      <AstVisualizer nodes={astGraph.nodes} edges={astGraph.edges} />
                    ) : (
                      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text)', opacity: 0.6, border: '1px dashed var(--card-border)', borderRadius: '12px' }}>
                        Loading AST... (Note: Only valid JS/TS is supported)
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: 'wrap' }}>
                <button 
                  className={styles.resetBtn} 
                  onClick={handleReset} 
                  style={{ flex: 1, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer', minWidth: '140px' }}
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