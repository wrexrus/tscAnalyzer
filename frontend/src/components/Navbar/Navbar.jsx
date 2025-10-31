import React, { useState } from 'react';
import './Navbar.css'; 

const Navbar = ({ onBotClick, currentTheme, toggleTheme }) => {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [chatbotHovered, setChatbotHovered] = useState(false);
  const isDark = currentTheme === "dark";

  return (
    <nav className="navbar">
      <div className="nav-left">
        {['Home', 'Learn', 'Analyze'].map(item => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className={`nav-link ${hoveredLink === item ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredLink(item)}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {item}
          </a>
        ))}
      </div>

      <div className="nav-right">
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>

        <div
          className={`chatbot-btn ${chatbotHovered ? 'hovered' : ''}`}
          onClick={onBotClick}
          onMouseEnter={() => setChatbotHovered(true)}
          onMouseLeave={() => setChatbotHovered(false)}
        >
          🤖 Ask me
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
