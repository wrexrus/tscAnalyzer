import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import Home from './Home';
import Learn from './components/Learn/Learn';
import Analyze from './components/Analyze/Analyze';
import Chatbot from './components/Chatbot/Chatbot';
import "./index.css";
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/ReactToastify.css';
import { isExpired } from './pages/utils';

const THEME_KEY = "themePreference";

const App = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();

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
  
  useEffect(()=>{

    const checkExpiry = ()=>{
      const token = localStorage.getItem("token");
      if(!token) return;
      if(isExpired(token)){
        localStorage.removeItem("token");
        localStorage.removeItem("loggedInUser");
        // notify other components in this tab
        window.dispatchEvent(new Event('authChanged'));
        navigate("/login");
      }
    };

    checkExpiry();
    const id = setInterval(checkExpiry,300_000); // every 30 seconds
    return ()=> clearInterval(id);
  },[navigate]);

  return (
    <>
      <div style={{ position: "relative", zIndex: 1 }}>
        <ToastContainer />
        <Routes> 
          <Route path='/' element={
          <>
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
          </>
          }/>
          <Route path='/login' element={<Login />}/>
          <Route path='/signup' element={<Signup />}/>
          <Route path='/dashboard' element={<Dashboard theme={theme} toggleTheme={toggleTheme} onBotClick={() => setChatOpen(true)} />}/>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Chatbot open={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </>
  )
}

export default App
