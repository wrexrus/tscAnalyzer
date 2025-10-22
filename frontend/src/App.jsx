import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './Home';
import Learn from './components/Learn/Learn';
import Analyze from './components/Analyze/Analyze';
import Chatbot from './components/Chatbot/Chatbot';

const App = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar onBotClick={() => setChatOpen(true)} />
        <Home />
        <Learn />
        <Analyze />
        <Chatbot open={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </>
  )
}

export default App
