import React from "react";

const ComplexityGraph = ({ explanation }) => {
  if (!explanation) return null;

  const match = explanation.match(/O\([^)]+\)/);
  const complexity = match ? match[0] : "Unknown";

  const complexityMap = {
    "O(1)": 10,
    "O(log n)": 30,
    "O(n)": 50,
    "O(n log n)": 70,
    "O(n^2)": 85,
    "O(2^n)": 100,
  };

  const value = complexityMap[complexity] || 40;

  return (
    <div style={styles.wrapper}>
      <p style={styles.label}>Detected: <strong>{complexity}</strong></p>
      <div style={styles.barBackground}>
        <div style={{ ...styles.barFill, width: `${value}%` }} />
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    fontFamily: "Inter, sans-serif",
    marginTop: "10px",
  },
  label: {
    marginBottom: "6px",
    fontSize: "14px",
    color: "#2c3e50",
  },
  barBackground: {
    height: "16px",
    width: "100%",
    background: "#ecf0f1",
    borderRadius: "8px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    background: "linear-gradient(90deg, #27ae60, #2980b9)",
    transition: "width 0.5s ease",
  },
};

export default ComplexityGraph;
