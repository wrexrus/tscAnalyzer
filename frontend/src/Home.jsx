import React, { useState, useEffect } from "react";
import "./Home.css"; // <-- IMPORT CSS

function Home() {
  const mainText = "Think faster. Code smarter.";
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [showSub, setShowSub] = useState(false);
  const [showTag, setShowTag] = useState(false);

  useEffect(() => {
    if (textIndex < mainText.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + mainText[textIndex]);
        setTextIndex(textIndex + 1);
      }, 60);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setShowSub(true), 300);
      setTimeout(() => setShowTag(true), 800);
    }
  }, [textIndex]);

  return (
    <section id="home" className="home-section">
      <h1 className="hero-text">{displayedText}</h1>

      <p className={`sub-text ${showSub ? "visible" : ""}`}>
        Your complexity journey starts here
      </p>

      <h3 className={`tag-text ${showTag ? "visible" : ""}`}>
        Crack the code — before it cracks your runtime!
      </h3>
    </section>
  );
}

export default Home;
