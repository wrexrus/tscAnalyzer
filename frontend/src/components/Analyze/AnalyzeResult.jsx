import React from "react";
import styles from "./Analyze.module.css";

const AnalyzeResult = ({ code, result, onReset, ComplexityGraph }) => (
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

    <span className={styles.resetBtn} onClick={onReset}>
      Test New Code
    </span>
  </div>
);

export default AnalyzeResult;
