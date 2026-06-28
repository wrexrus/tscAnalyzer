import React, { useEffect, useState } from 'react';
import './Navbar.css';
import { ToastContainer } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleSuccess } from '../../pages/utils';
import { Sun, Moon, Bot} from 'lucide-react';


const Navbar = ({ onBotClick, currentTheme, toggleTheme }) => {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [chatbotHovered, setChatbotHovered] = useState(false);
  const isDark = currentTheme === "dark";
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('loggedInUser'));
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

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
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        {isDashboard ? (
          <a
            onClick={() => navigate('/')}
            className={`nav-link ${hoveredLink === 'Home' ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredLink('Home')}
            onMouseLeave={() => setHoveredLink(null)}
            style={{ cursor: 'pointer' }}
          >
            Home
          </a>
        ) : (
          ['Home', 'Learn', 'Analyze'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`nav-link ${hoveredLink === item ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredLink(item)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {item}
            </a>
          ))
        )}
      </div>

      <div className="nav-right">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          <span className="theme-label">{isDark ? 'Light' : 'Dark'}</span>
        </button>

        {!isDashboard && (
          <div
            className={`chatbot-btn ${chatbotHovered ? 'hovered' : ''}`}
            onClick={onBotClick}
            onMouseEnter={() => setChatbotHovered(true)}
            onMouseLeave={() => setChatbotHovered(false)}
          >
            <Bot size={18}/>
            Chatbot
          </div>
        )}

        {loggedInUser ? (
          <div className="user-section" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div 
              className="profile-avatar" 
              onClick={() => setShowDropdown(!showDropdown)}
              title={loggedInUser}
            >
              {loggedInUser.charAt(0).toUpperCase()}
            </div>
            {showDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-user">{loggedInUser}</div>
                <hr className="dropdown-divider" />
                <button 
                  className="dropdown-logout" 
                  onClick={() => { setShowDropdown(false); handleLogout(); }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="auth-btn login-btn" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="auth-btn signup-btn" onClick={() => navigate('/signup')}>
              SignUp
            </button>
          </div>
        )}

        <ToastContainer />
      </div>

    </nav>
  );
};

export default Navbar;
