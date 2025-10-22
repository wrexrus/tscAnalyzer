import React from "react";
import styles from "./Analyze.module.css";

const AnalyzeForm = ({ code, setCode, loading, progress, onAnalyze }) => (
  <div className={styles.inputWrapper}>
    <textarea
      className={styles.textarea}
      placeholder="Drop your code!"
      value={code}
      onChange={(e) => setCode(e.target.value)}
    />
    <button
      className={`${styles.analyzeBtn} ${loading ? styles.analyzeBtnDisabled : ""}`}
      onClick={onAnalyze}
      disabled={loading}
      aria-busy={loading}
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
);

export default AnalyzeForm;
