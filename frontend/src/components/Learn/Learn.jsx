import React, { useState, useEffect } from "react";
import QuizCard from "../QuizCard/QuizCard";
import { explanations, TOPIC_CATEGORIES } from "./constants";
import ReactMarkdown from "react-markdown";
import { API_BASE_URL } from "../../api";
import { Video, BookOpen, Loader2, Link } from "lucide-react";
import masteryGuide from "./masteryGuide.md?raw";
import "./Learn.css";
import { TextCursor } from 'lucide-react';

const tiers = {
  "O(1)": "excellent",
  "O(log N)": "excellent",
  "O(√N)": "good",
  "O(N)": "good",
  "O(N log N)": "fair",
  "O(N²)": "bad",
  "O(N³)": "bad",
  "O(2^N)": "horrible",
  "O(N!)": "horrible"
};

const Learn = () => {
  const [activeTopic, setActiveTopic] = useState(null); 
  const [activeVideo, setActiveVideo] = useState("https://www.youtube.com/embed/uBE9zLU--DA?si=KnikDenx20tyEv6E"); 
  const [learnMode, setLearnMode] = useState("watch");
  const [aiLesson, setAiLesson] = useState("");
  const [lessonLoading, setLessonLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Big-O Growth section states
  const [activeO, setActiveO] = useState(null);
  const [hoverHeading, setHoverHeading] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    if (learnMode === "read") {
      if (!activeTopic) {
        // setAiLesson(masteryGuide);
        setAiLesson("Roadmap - https://roadmap.sh/datastructures-and-algorithms");
        setLessonLoading(false);
      } else {
        fetchAiLesson(activeTopic);
      }
    }
  }, [activeTopic, learnMode]);

  const fetchAiLesson = async (topic) => {
    setLessonLoading(true);
    setIsStreaming(false);
    setAiLesson("");
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/learn-concept?topic=${encodeURIComponent(topic)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setLessonLoading(false);
      setIsStreaming(true);
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkString = decoder.decode(value, { stream: true });
          const lines = chunkString.split("\n\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6);
              if (dataStr === "[DONE]") {
                done = true;
                break;
              }
              try {
                const dataObj = JSON.parse(dataStr);
                if (dataObj.error) {
                  setAiLesson(prev => prev + "\n\n**Error:** " + dataObj.error);
                  done = true;
                  break;
                } else if (dataObj.text) {
                  setAiLesson(prev => prev + dataObj.text);
                }
              } catch (e) {
                console.error("Error parsing stream chunk:", e);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching AI lesson stream:", err);
      setAiLesson("Failed to load AI lesson. Please try again later.");
      setLessonLoading(false);
      setIsStreaming(false);
    }
    setIsStreaming(false);
  };

  return (
    <section id="learn" className="learn-section">
      <div className="learn-card">
        <h1 className="learn-title">Dynamic Concept Library</h1>
        <p className="learn-subtitle">Select a topic to start learning via curated videos or AI-generated lessons.</p>

        {/* Categorized Topic Selectors */}
        <div className="categories-container">
          {Object.entries(TOPIC_CATEGORIES).map(([categoryName, topics]) => (
            <div key={categoryName} className="category-section">
              <h3 className="category-heading">{categoryName}</h3>
              <div className="topic-pills">
                {Object.entries(topics).map(([topic, videoUrl]) => (
                  <button
                    key={topic}
                    className={`topic-pill ${activeTopic === topic ? "active" : ""}`}
                    onClick={() => {
                      if (activeTopic === topic) {
                        setActiveTopic(null);
                        setActiveVideo("https://www.youtube.com/embed/FPu9Uld7W-E?start=75"); // default roadmap
                      } else {
                        setActiveTopic(topic);
                        setActiveVideo(videoUrl);
                      }
                    }}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mode-toggle">
          <button
            className={`mode-btn ${learnMode === "watch" ? "active" : ""}`}
            onClick={() => setLearnMode("watch")}
          >
            <Video size={18} /> Watch
          </button>
          <button
            className={`mode-btn ${learnMode === "read" ? "active" : ""}`}
            onClick={() => setLearnMode("read")}
          >
            <BookOpen size={18} /> Read (AI Tutor)
          </button>
        </div>

        {/* Content Rendering */}
        <div className="dynamic-content-area">
          {learnMode === "watch" ? (
            <div className="learn-video">
              <iframe
                title={`${activeTopic} Video`}
                width="680"
                height="405"
                src={activeVideo}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="ai-lesson-box">
              {lessonLoading ? (
                <div className="ai-lesson-loading">
                  <Loader2 className="spinner" size={32} />
                  <p>Generating personalized lesson for {activeTopic || "mastering DSA & Architecture"}...</p>
                </div>
              ) : (
                <>
                  <ReactMarkdown>{aiLesson}</ReactMarkdown>
                  {isStreaming && <span className="streaming-cursor"><TextCursor /></span>}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="learn-card">
        <h2
          className={`learn-heading ${hoverHeading ? "hovered" : ""}`}
          onMouseEnter={() => setHoverHeading(true)}
          onMouseLeave={() => setHoverHeading(false)}
        >
          <span className="heading-text default-text" style={{fontSize:40}}>Growth of Big O</span>
          <span className="heading-text hover-text">The smaller the Big-O, the better the performance</span>
        </h2>

        <div className="learn-wrapper">
          {Object.keys(explanations).map((item, index) => {
            const isHovered = hoveredItem === item;
            const tier = tiers[item] || "good";
            return (
              <React.Fragment key={index}>
                <span
                  onClick={() =>
                    setActiveO((prev) => (prev === item ? null : item))
                  }
                  className={`learn-o tier-${tier} ${isHovered ? "hovered" : ""} ${
                    activeO === item ? "active" : ""
                  }`}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {item}
                </span>
                {index !== Object.keys(explanations).length - 1 && (
                  <span className="learn-separator">{`<`}</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {activeO && (
          <div className={`learn-explanation text-${tiers[activeO] || 'good'}`}>{explanations[activeO]}</div>
        )}
      </div>

      <div className="learn-card">
        <h2 className="learn-heading">Data Structures Cheat Sheet</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="cheat-sheet-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Data Structure</th>
                <th>Access</th>
                <th>Search</th>
                <th>Insertion</th>
                <th>Deletion</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ textAlign: 'left', fontWeight: 600 }}>Array</td>
                <td><span className="cs-cell cs-excel">O(1)</span></td>
                <td><span className="cs-cell cs-bad">O(N)</span></td>
                <td><span className="cs-cell cs-bad">O(N)</span></td>
                <td><span className="cs-cell cs-bad">O(N)</span></td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left', fontWeight: 600 }}>Stack</td>
                <td><span className="cs-cell cs-bad">O(N)</span></td>
                <td><span className="cs-cell cs-bad">O(N)</span></td>
                <td><span className="cs-cell cs-excel">O(1)</span></td>
                <td><span className="cs-cell cs-excel">O(1)</span></td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left', fontWeight: 600 }}>Queue</td>
                <td><span className="cs-cell cs-bad">O(N)</span></td>
                <td><span className="cs-cell cs-bad">O(N)</span></td>
                <td><span className="cs-cell cs-excel">O(1)</span></td>
                <td><span className="cs-cell cs-excel">O(1)</span></td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left', fontWeight: 600 }}>Singly-Linked List</td>
                <td><span className="cs-cell cs-bad">O(N)</span></td>
                <td><span className="cs-cell cs-bad">O(N)</span></td>
                <td><span className="cs-cell cs-excel">O(1)</span></td>
                <td><span className="cs-cell cs-excel">O(1)</span></td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left', fontWeight: 600 }}>Hash Table</td>
                <td><span className="cs-cell cs-excel">O(1)</span></td>
                <td><span className="cs-cell cs-excel">O(1)</span></td>
                <td><span className="cs-cell cs-excel">O(1)</span></td>
                <td><span className="cs-cell cs-excel">O(1)</span></td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left', fontWeight: 600 }}>Binary Search Tree</td>
                <td><span className="cs-cell cs-good">O(log N)</span></td>
                <td><span className="cs-cell cs-good">O(log N)</span></td>
                <td><span className="cs-cell cs-good">O(log N)</span></td>
                <td><span className="cs-cell cs-good">O(log N)</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="learn-card">
        <h2 className="learn-heading">Practice Questions</h2>
        <div className="learn-quiz">
          <QuizCard />
        </div>
      </div>
    </section>
  );
};

export default Learn;
