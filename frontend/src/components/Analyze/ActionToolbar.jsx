import React, { useState } from 'react';
import styles from './Analyze.module.css';

const ActionToolbar = ({ code, mode, setMode, targetLanguage, setTargetLanguage, onAction, loading, progress }) => {
  const [showConvertMenu, setShowConvertMenu] = useState(false);

  const handleActionClick = (selectedMode, customLang = null) => {
    setMode(selectedMode);
    setShowConvertMenu(false);
    onAction(selectedMode, customLang);
  };

  const languages = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust'];

  return (
    <div className={styles.toolbarContainer} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
      <button
        className={`${styles.actionBtn} ${loading && mode === 'analyze' ? styles.actionBtnActive : ''}`}
        onClick={() => handleActionClick('analyze')}
        disabled={loading}
      >
        {loading && mode === 'analyze' && <span className={styles.progressFill} style={{ width: `${progress}%` }} />}
        <span className={styles.btnLabel}>Analyze</span>
      </button>

      <button
        className={`${styles.actionBtn} ${loading && mode === 'optimize' ? styles.actionBtnActive : ''}`}
        onClick={() => handleActionClick('optimize')}
        disabled={loading}
      >
        {loading && mode === 'optimize' && <span className={styles.progressFill} style={{ width: `${progress}%` }} />}
        <span className={styles.btnLabel}>Optimize</span>
      </button>

      <div style={{ position: 'relative' }}>
        <button
          className={`${styles.actionBtn} ${loading && mode === 'convert' ? styles.actionBtnActive : ''}`}
          onClick={() => setShowConvertMenu(!showConvertMenu)}
          disabled={loading}
        >
          {loading && mode === 'convert' && <span className={styles.progressFill} style={{ width: `${progress}%` }} />}
          <span className={styles.btnLabel}>Convert ▾</span>
        </button>

        {showConvertMenu && !loading && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: '8px',
            backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)',
            borderRadius: '8px', zIndex: 10, display: 'flex', flexDirection: 'row',
            boxShadow: 'var(--shadow)', padding: '5px', minWidth: '150px'
          }}>
            {languages.map(lang => (
              <div 
                key={lang}
                onClick={() => {
                  setTargetLanguage(lang);
                  handleActionClick('convert', lang);
                }}
                style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => e.target.style.border = '2px solid black'}
                onMouseLeave={(e) => e.target.style.border = 'none'}
              >
                {lang}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className={`${styles.actionBtn} ${loading && mode === 'test' ? styles.actionBtnActive : ''}`}
        onClick={() => handleActionClick('test')}
        disabled={loading}
      >
        {loading && mode === 'test' && <span className={styles.progressFill} style={{ width: `${progress}%` }} />}
        <span className={styles.btnLabel}>Test My Knowledge</span>
      </button>
    </div>
  );
};

export default ActionToolbar;
