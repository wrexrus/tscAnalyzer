import React from "react";

const scale = [
  { label: 'O(1)', val: 'O(1)', color: '#10B981', desc: 'Excellent (Constant Time)' },
  { label: 'O(log N)', val: 'O(LOG N)', color: '#34D399', desc: 'Good (Logarithmic Time)' },
  { label: 'O(N)', val: 'O(N)', color: '#84CC16', desc: 'Fair (Linear Time)' },
  { label: 'O(N log N)', val: 'O(N LOG N)', color: '#FACC15', desc: 'Moderate (Linearithmic Time)' },
  { label: 'O(N²)', val: 'O(N^2)', color: '#F97316', desc: 'Slow (Quadratic Time)' },
  { label: 'O(2^N)', val: 'O(2^N)', color: '#EF4444', desc: 'Terrible (Exponential Time)' }
];

const ComplexityGraph = ({ explanation }) => {
  if (!explanation) return null;

  const match = explanation.match(/O\([^)]+\)/i);
  let complexity = match ? match[0].toUpperCase() : "Unknown";
  
  // Normalize spacing for matching
  complexity = complexity.replace(/\s+/g, ' ').replace('O(N*LOG N)', 'O(N LOG N)').replace('O(N LOGN)', 'O(N LOG N)');

  let activeIndex = scale.findIndex(s => s.val === complexity);
  if (activeIndex === -1 && complexity !== "Unknown") {
      if (complexity.includes('N^2')) activeIndex = 4;
      else if (complexity.includes('LOG')) activeIndex = complexity.includes('N') ? 3 : 1;
      else if (complexity.includes('2^N') || complexity.includes('!')) activeIndex = 5;
      else if (complexity === 'O(N)') activeIndex = 2;
      else if (complexity === 'O(1)') activeIndex = 0;
  }

  const activeItem = activeIndex !== -1 ? scale[activeIndex] : null;

  return (
    <div style={styles.wrapper}>
      <p style={styles.label}>Time Complexity Meter: <strong style={{ color: activeItem ? activeItem.color : 'inherit' }}>{match ? match[0] : 'Unknown'}</strong></p>
      
      <div style={styles.barContainer}>
        {scale.map((item, index) => {
          const isFilled = activeIndex !== -1 && index <= activeIndex;
          const isCurrent = activeIndex === index;
          return (
            <div key={item.val} style={{
              flex: 1,
              backgroundColor: isFilled ? item.color : 'var(--card-border)',
              opacity: isFilled && !isCurrent ? 0.3 : (isFilled ? 1 : 0.1),
              height: '100%',
              borderRight: index < scale.length - 1 ? '1px solid var(--card-bg)' : 'none',
              transition: 'all 0.4s ease'
            }} />
          )
        })}
      </div>

      <div style={styles.labelsContainer}>
        {scale.map((item, index) => {
           const isCurrent = activeIndex === index;
           return (
             <div key={item.val} style={{ flex: 1, textAlign: 'center', transition: 'all 0.3s ease' }}>
                <span style={{ 
                  fontSize: '11px', 
                  color: isCurrent ? item.color : 'var(--text)',
                  opacity: isCurrent ? 1 : 0.5,
                  fontWeight: isCurrent ? 'bold' : 'normal'
                }}>
                  {item.label}
                </span>
             </div>
           )
        })}
      </div>

      {activeItem && (
        <div style={{ ...styles.evalBox, borderLeftColor: activeItem.color }}>
          <strong style={{ color: activeItem.color }}>{activeItem.desc.split(' (')[0]}</strong> 
          <span style={{ opacity: 0.8, marginLeft: '6px', fontSize: '13px' }}>({activeItem.desc.split('(')[1]}</span>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    fontFamily: "Inter, sans-serif",
    marginTop: "20px",
  },
  label: {
    marginBottom: "12px",
    fontSize: "15px",
    color: "var(--text)",
  },
  barContainer: {
    display: 'flex',
    width: '100%',
    height: '18px',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: 'var(--card-border)',
  },
  labelsContainer: {
    display: 'flex', 
    justifyContent: 'space-between', 
    marginTop: '8px',
    width: '100%'
  },
  evalBox: {
    marginTop: '15px',
    padding: '12px 15px',
    borderRadius: '8px',
    backgroundColor: 'var(--card-border)',
    borderLeft: '4px solid transparent',
    color: 'var(--text)',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
  },
  scale: {
    fontSize: '2rem'
  }
};

export default ComplexityGraph;
