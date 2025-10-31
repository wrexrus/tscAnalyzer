import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import Home from './Home';
import Learn from './components/Learn/Learn';
import Analyze from './components/Analyze/Analyze';
import Chatbot from './components/Chatbot/Chatbot';
import "./index.css";

const THEME_KEY = "themePreference";

const App = () => {
  const [chatOpen, setChatOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved ? saved : "light"; 
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(prev => (prev === "dark" ? "light" : "dark"));

  return (
    <>
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar 
        onBotClick={() => 
          setChatOpen(true)
        } 
        currentTheme={theme} 
        toggleTheme={toggleTheme}
        />

        <Home />
        <Learn />
        <Analyze />
        <Chatbot open={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </>
  )
}

export default App
