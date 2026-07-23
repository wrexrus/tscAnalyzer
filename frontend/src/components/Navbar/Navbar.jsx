import React, { useEffect, useState } from 'react';
import './Navbar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleSuccess } from '../../pages/utils';
import { Sun, Moon, Bot, Menu, X, LayoutDashboard } from 'lucide-react';


const Navbar = ({ onBotClick, currentTheme, toggleTheme }) => {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [chatbotHovered, setChatbotHovered] = useState(false);
  const isDark = currentTheme === "dark";
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('loggedInUser'));
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  useEffect(() => {
    setLoggedInUser(localStorage.getItem('loggedInUser'));
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

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Learn', id: 'learn' },
    { name: 'Unified Code', id: 'analyze' },
  ];

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
          navLinks.map(item => (
            <a
              key={item.name}
              href={`#${item.id}`}
              className={`nav-link ${hoveredLink === item.name ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredLink(item.name)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {item.name}
            </a>
          ))
        )}
      </div>

      {/* hamburger Icon for Mobile */}
      <div className="hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </div>

      <div className={`nav-right ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* mobile menu links */}
        {isMobileMenuOpen && (
          <div className="mobile-nav-links">
            {isDashboard ? (
              <a onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} className="nav-link">Home</a>
            ) : (
              navLinks.map(item => (
                <a key={item.name} href={`#${item.id}`} className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  {item.name}
                </a>
              ))
            )}
            {loggedInUser && (
              <a onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }} className="nav-link" style={{ cursor: 'pointer' }}>
                Dashboard
              </a>
            )}
          </div>
        )}

        {/* theme toggle */}
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          <span className="theme-label">{isDark ? 'Light' : 'Dark'}</span>
        </button>

        {/* chatbot — hidden on dashboard */}
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

        {/* Auth section */}
        {loggedInUser ? (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!isDashboard && (
              <button
                className="dashboard-nav-btn"
                onClick={() => navigate('/dashboard')}
                title="Go to Dashboard"
                style={{marginRight:'15px'}}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </button>
            )}
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
      </div>
    </nav>
  );
};

export default Navbar;
