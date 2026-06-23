import React, { useEffect, useState } from 'react';
import './Navbar.css';
import { ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { handleSuccess } from '../../pages/utils';

const Navbar = ({ onBotClick, currentTheme, toggleTheme }) => {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [chatbotHovered, setChatbotHovered] = useState(false);
  const isDark = currentTheme === "dark";
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('loggedInUser'));
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedInUser(localStorage.getItem('loggedInUser'));
    // update on storage changes (other tabs) and on custom authChanged event (this tab)
    const onAuthChange = () => setLoggedInUser(localStorage.getItem('loggedInUser'));
    window.addEventListener('storage', onAuthChange);
    window.addEventListener('authChanged', onAuthChange);
    return () => {
      window.removeEventListener('storage', onAuthChange);
      window.removeEventListener('authChanged', onAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('token');
    setLoggedInUser(null);
    window.dispatchEvent(new Event('authChanged'));
    handleSuccess('Logged out successfully');
  };

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
          {isDark ? 'Light' : 'Dark'}
        </button>

        <div
          className={`chatbot-btn ${chatbotHovered ? 'hovered' : ''}`}
          onClick={onBotClick}
          onMouseEnter={() => setChatbotHovered(true)}
          onMouseLeave={() => setChatbotHovered(false)}
        >
          🤖 Ask me
        </div>

        {loggedInUser ? (
          <div className="user-section" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span className="profile-name" style={{ fontWeight: '600' }}>
              {loggedInUser}
            </span>
            <button className="auth-btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <button className="auth-btn signup-btn" onClick={() => navigate('/signup')}>
            SignUp
          </button>
        )}

        <ToastContainer />
      </div>

    </nav>
  );
};

export default Navbar;
