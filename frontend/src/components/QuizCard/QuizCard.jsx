import React, { useState } from "react";
import styles from "./QuizCard.module.css";
import axios from "axios"; // Import axios for API calls

let topics = [
  "Quick Sort",
  "Merge Sort",
  "Binary Search",
  "Strings",
  "Arrays",
  "Singly Linked lists",
  "Doubly Linked lists",
  "Trees",
  "Graphs",
  "Recursion", "Stack and Queues", "Binary Trees",
];

const QuizCard = () => {
  // Mode state: 'topics' | 'difficulty' | 'quiz' | 'loading'
  const [viewMode, setViewMode] = useState("topics");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showScoreHelper, setShowScoreHelper] = useState(false);

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setViewMode("difficulty");
  };

  const handleDifficultySelect = async (difficulty) => {
    setViewMode("loading");

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || "http://localhost:5000";
      const response = await axios.post(`${API_BASE_URL}/quiz/generate-questions`, {
        topic: selectedTopic,
        difficulty,
      });
      setCurrentQuestions(response.data.questions);
      setViewMode("quiz");
      resetQuizState();
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert("Error generating questions. Please try again.");
      setViewMode("topics"); // Go back to topics view on error
    }
  };

  const resetQuizState = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setShowScoreHelper(false);
  };

  const handleOptionClick = (index) => {
    if (!isSubmitted) {
      setSelectedOption(index);
      setIsSubmitted(true);
      if (index === currentQuestions[currentIndex]?.correctIndex) {
        setScore((prev) => prev + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < currentQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setShowScoreHelper(true);
    }
  };

  const handleRestart = () => {
    setViewMode("topics");
    setSelectedTopic(null);
    resetQuizState();
  };

  // --- RENDER HELPERS ---

  if (viewMode === "loading") {
    return (
      <div className={styles["quiz-card"]}>
        <h3 style={{ color: "#888" }}>Generating {selectedTopic} questions...</h3>
        <p style={{ color: "#555", marginTop: "10px" }}>This might take a few seconds.</p>
      </div>
    );
  }

  // 1. TOPIC SELECTION View
  if (viewMode === "topics") {
    const row1 = topics.slice(0, 3);
    const row2 = topics.slice(3, 7);
    const row3 = topics.slice(7);
    
    const isLoggedIn = !!localStorage.getItem("token");

    return (
      <div className={styles["quiz-container"]}>
        {!isLoggedIn && (
          <div style={{ textAlign: "center", marginBottom: "10px", color: "#ffadad", fontStyle: "italic", fontSize: "1.1rem" }}>
            * Do login to save progress
          </div>
        )}
        <div className={styles["topic-row"]}>
          {row1.map((topic) => (
            <button
              key={topic}
              className={styles["topic-text"]}
              onClick={() => handleTopicSelect(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
        <div className={styles["topic-row"]}>
          {row2.map((topic) => (
            <button
              key={topic}
              className={styles["topic-text"]}
              onClick={() => handleTopicSelect(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
        <div className={styles["topic-row"]}>
          {row3.map((topic) => (
            <button
              key={topic}
              className={styles["topic-text"]}
              onClick={() => handleTopicSelect(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 1.5 DIFFICULTY SELECTION View
  if (viewMode === "difficulty") {
    return (
      <div className={styles["quiz-card"]}>
        <h2 className={styles["quiz-question"]} style={{ marginBottom: "40px" }}>
          Select Difficulty for {selectedTopic}
        </h2>
        <div className={styles["difficulty-container"]}>
          <button 
            className={`${styles["quiz-option"]} ${styles["difficulty-btn"]} ${styles["basic"]}`}
            onClick={() => handleDifficultySelect("basic")}
          >
            Basic
          </button>
          <button 
            className={`${styles["quiz-option"]} ${styles["difficulty-btn"]} ${styles["advanced"]}`}
            onClick={() => handleDifficultySelect("advanced")}
          >
            Advanced
          </button>
        </div>
        <button onClick={handleRestart} className={styles["quiz-restart-btn"]} style={{ marginTop: "40px" }}>
          Back to Topics
        </button>
      </div>
    );
  }

  // 2. QUIZ TAKING View
  const currentQuestion = currentQuestions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className={styles["quiz-card"]}>
        <h3 style={{ color: "#f44336" }}>Error loading questions.</h3>
        <button onClick={handleRestart} className={styles["quiz-restart-btn"]}>Back to Topics</button>
      </div>
    );
  }

  return (
    <div className={styles["quiz-card"]}>
      {!showScoreHelper ? (
        <>
          <h3 className={styles["quiz-question"]}>
            {currentIndex + 1}. {currentQuestion.text}
          </h3>

          <div style={{ width: "100%", maxWidth: "600px" }}>
            {currentQuestion.options.map((opt, idx) => {
              const isCorrect = idx === currentQuestion.correctIndex;
              const isSelected = idx === selectedOption;

              let btnClass = styles["quiz-option"];
              if (isSubmitted) {
                if (isCorrect) btnClass += ` ${styles["correct"]}`;
                else if (isSelected) btnClass += ` ${styles["incorrect"]}`;
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  className={btnClass}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {isSubmitted && (
            <div className={styles["quiz-result-box"]}>
              <strong
                style={{
                  color:
                    selectedOption === currentQuestion.correctIndex
                      ? "#4caf50"
                      : "#f44336",
                }}
              >
                {selectedOption === currentQuestion.correctIndex
                  ? "✅ Correct!"
                  : "❌ Incorrect!"}
              </strong>
              <p className={styles["quiz-explanation"]}>
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {isSubmitted && (
            <button onClick={handleNext} className={styles["quiz-next-btn"]}>
              {currentIndex + 1 === currentQuestions.length
                ? "See Results"
                : "Next Question"}
            </button>
          )}
        </>
      ) : (
        <div className={styles["quiz-score-display"]}>
          <h2>
            Score: {score} / {currentQuestions.length}
          </h2>
          <p style={{ color: "#aaa", marginBottom: "20px" }}>
            {score === currentQuestions.length
              ? "Perfect score! You're a pro! "
              : "Good practice! Keep it up. "}
          </p>
          <button onClick={handleRestart} className={styles["quiz-restart-btn"]}>
            Choose Another Topic
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizCard;
