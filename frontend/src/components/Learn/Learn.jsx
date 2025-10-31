import React, { useState } from "react";
import QuizCard from "../QuizCard/QuizCard";
import { explanations } from "./constants";
import "./Learn.css";

const Learn = () => {
  const [activeO, setActiveO] = useState(null);
  const [hoverHeading, setHoverHeading] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <section id="learn" className="learn-section">
      <div className="learn-card">
        <h1 className="learn-title">Learn</h1>
        <div className="learn-video">
          <iframe
            title="learning-video"
            width="680"
            height="405"
            src="https://www.youtube.com/embed/FPu9Uld7W-E?start=75"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* ========= BIG-O GROWTH ========= */}
      <div className="learn-card">
        <h2
          className="learn-heading"
          onMouseEnter={() => setHoverHeading(true)}
          onMouseLeave={() => setHoverHeading(false)}
        >
          {hoverHeading
            ? "The smaller the Big-O, the better the performance"
            : "Growth of Big O"}
        </h2>

        <div className="learn-wrapper">
          {Object.keys(explanations).map((item, index) => {
            const isHovered = hoveredItem === item;
            return (
              <span
                key={index}
                onClick={() =>
                  setActiveO((prev) => (prev === item ? null : item))
                }
                className={`learn-o ${isHovered ? "hovered" : ""} ${
                  activeO === item ? "active" : ""
                }`}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {item}
                {index !== Object.keys(explanations).length - 1 && (
                  <span className="learn-separator">{`<`}</span>
                )}
              </span>
            );
          })}
        </div>

        {activeO && (
          <div className="learn-explanation">{explanations[activeO]}</div>
        )}
      </div>

      {/* ========= PRACTICE QUESTIONS ========= */}
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
