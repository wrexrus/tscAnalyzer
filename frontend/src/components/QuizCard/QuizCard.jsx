import React, { useState } from "react";
import styles from "./QuizCard.module.css";
import axios from "axios";
import { API_BASE_URL } from "../../api";
import { handleError } from "../../pages/utils";
import { Lightbulb,CircleCheck,CircleX } from 'lucide-react';

const MODES = {
  "Classic DSA": {
    "Linear Data Structures": ["Arrays & Strings", "Linked Lists", "Stacks & Queues"],
    "Non-Linear Data Structures": ["Trees & Graphs", "Heaps & Tries", "Hash Tables"],
    "Algorithms & Paradigms": ["Sorting & Searching", "Recursion", "Dynamic Programming", "Greedy Algorithms", "Divide & Conquer"]
  },
  "Code Debugging & Complexity": {
    "Core CS": ["Time Complexity (Big-O)", "Space Complexity", "Bit Manipulation"],
    "Debugging": ["Spot the Bug", "Edge Case Identification", "Memory Leaks"]
  },
  "System Design": {
    "Architecture": ["Load Balancing", "Caching Strategies", "Microservices", "Rate Limiting"],
    "Databases": ["SQL vs NoSQL", "Database Sharding", "CAP Theorem"]
  }
};

const QuizCard = () => {
  // Mode state: 'modes' | 'categories' | 'topics' | 'difficulty' | 'quiz' | 'loading'
  const [viewMode, setViewMode] = useState("modes");
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showScoreHelper, setShowScoreHelper] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  React.useEffect(() => {
    const onAuthChange = () => setIsLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', onAuthChange);
    window.addEventListener('authChanged', onAuthChange);
    return () => {
      window.removeEventListener('storage', onAuthChange);
      window.removeEventListener('authChanged', onAuthChange);
    };
  }, []);

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setViewMode("categories");
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setViewMode("topics");
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setViewMode("difficulty");
  };

  const handleDifficultySelect = async (difficulty) => {
    setSelectedDifficulty(difficulty);
    setViewMode("loading");

    try {
      const response = await axios.post(`${API_BASE_URL}/quiz/generate-questions`, {
        mode: selectedMode,
        topic: selectedTopic,
        difficulty,
      });
      setCurrentQuestions(response.data.questions);
      setViewMode("quiz");
      resetQuizState();
    } catch (error) {
      console.error("Error fetching questions:", error);
      if (error.response && error.response.status === 503) {
        handleError(error.response.data.error || "The AI model is currently experiencing high demand. Please wait a moment and try again!");
      } else {
        handleError("Error generating questions. Please try again.");
      }
      setViewMode("topics"); 
    }
  };

  const resetQuizState = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
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

  const handleNext = async () => {
    setUserAnswers((prev) => [...prev, selectedOption]);

    if (currentIndex + 1 < currentQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setShowScoreHelper(true);
      if (isLoggedIn) {
        try {
          await axios.post(`${API_BASE_URL}/quiz/save-result`, {
            mode: selectedMode,
            category: selectedCategory,
            topic: selectedTopic,
            difficulty: selectedDifficulty,
            score: score,
            totalQuestions: currentQuestions.length
          }, {
            headers: { Authorization: localStorage.getItem('token') }
          });
        } catch (error) {
          console.error("Failed to save quiz result:", error);
        }
      }
    }
  };

  const handleRestart = () => {
    setViewMode("modes");
    setSelectedMode(null);
    setSelectedCategory(null);
    setSelectedTopic(null);
    resetQuizState();
  };

  const handleRegenerate = () => {
    if (selectedDifficulty) {
      handleDifficultySelect(selectedDifficulty);
    }
  };

  // --- RENDER HELPERS ---

  if (viewMode === "loading") {
    return (
      <div className={styles["quiz-card"]}>
        <h3 style={{ color: "var(--text)", opacity: 0.8 }}>Generating {selectedTopic} questions...</h3>
        <p style={{ color: "var(--text)", opacity: 0.6, marginTop: "10px" }}>This might take a few seconds.</p>
      </div>
    );
  }

  // 1. MODE SELECTION View
  if (viewMode === "modes") {
    return (
      <div className={styles["quiz-container"]}>
        {!isLoggedIn && (
          <div style={{ textAlign: "center", marginBottom: "10px", color: "red", opacity: 0.7, fontStyle: "italic", fontSize: "1.1rem" }}>
            * Do login to save progress
          </div>
        )}
        <h2 className={styles["quiz-question"]} style={{ marginBottom: "20px" }}>
          Select Interview Mode
        </h2>
        <div className={styles["difficulty-container"]} style={{ maxWidth: "600px", marginBottom: "30px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {Object.keys(MODES).map(mode => (
            <button
              key={mode}
              className={`${styles["quiz-option"]} ${styles["difficulty-btn"]}`}
              onClick={() => handleModeSelect(mode)}
              style={{ width: "100%", padding: "15px" }}
            >
              {mode}
            </button>
          ))}
        </div>
        
        {isLoggedIn && (
          <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
            <button 
              className={styles["quiz-restart-btn"]} 
              onClick={() => window.location.href = '/dashboard?tab=progress'}
            >
              Check Progress
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. CATEGORY SELECTION View
  if (viewMode === "categories") {
    const modeCategories = MODES[selectedMode] || {};
    return (
      <div className={styles["quiz-container"]}>
        <h2 className={styles["quiz-question"]} style={{ marginBottom: "20px" }}>
          Select a Category
        </h2>
        <div className={styles["difficulty-container"]} style={{ maxWidth: "600px", marginBottom: "30px" }}>
          {Object.keys(modeCategories).map(category => (
            <button
              key={category}
              className={`${styles["quiz-option"]} ${styles["difficulty-btn"]}`}
              onClick={() => handleCategorySelect(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        <button onClick={() => setViewMode("modes")} className={styles["quiz-restart-btn"]} style={{ marginTop: "20px" }}>
          Back to Modes
        </button>
      </div>
    );
  }

  // 3. TOPIC SELECTION View
  if (viewMode === "topics") {
    const categoryTopics = MODES[selectedMode][selectedCategory] || [];
    return (
      <div className={styles["quiz-container"]}>
        <h2 className={styles["quiz-question"]} style={{ marginBottom: "20px" }}>
          {selectedCategory} Topics
        </h2>
        <div className={styles["topic-row"]}>
          {categoryTopics.map((topic) => (
            <button
              key={topic}
              className={styles["topic-text"]}
              onClick={() => handleTopicSelect(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
        <button onClick={() => setViewMode("categories")} className={styles["quiz-restart-btn"]} style={{ marginTop: "40px" }}>
          Back to Categories
        </button>
      </div>
    );
  }

  // 4. DIFFICULTY SELECTION View
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
        <button onClick={() => setViewMode("topics")} className={styles["quiz-restart-btn"]} style={{ marginTop: "40px" }}>
          Back to Topics
        </button>
      </div>
    );
  }

  // 5. QUIZ TAKING View
  const currentQuestion = currentQuestions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className={styles["quiz-card"]}>
        <h3 style={{ color: "#f44336" }}>Error loading questions.</h3>
        <button onClick={handleRestart} className={styles["quiz-restart-btn"]}>Back to Categories</button>
      </div>
    );
  }

  return (
    <div className={styles["quiz-card"]}>
      {!showScoreHelper ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', maxWidth: '600px', marginBottom: '40px' }}>
            <h3 className={styles["quiz-question"]} style={{ margin: 0, textAlign: 'left', flex: 1, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {currentIndex + 1}. {currentQuestion.text}
            </h3>
            <button onClick={handleRestart} className={styles["quiz-quit-btn"]}>
              Quit
            </button>
          </div>

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
                  ? "Correct!"
                  : "Incorrect!"}
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
          <p style={{ color: "var(--text)", opacity: 0.7, marginBottom: "20px" }}>
            {score === currentQuestions.length
              ? "Perfect score! You're a pro! "
              : "Good practice! Keep it up. "}
          </p>

          <div className={styles["review-list"]}>
            {currentQuestions.map((q, idx) => {
              const userAnswer = userAnswers[idx];
              const isCorrect = userAnswer === q.correctIndex;

              return (
                <div key={idx} className={styles["review-card"]}>
                  <h4 className={styles["review-question"]}>Q{idx + 1}: {q.text}</h4>
                  
                  <p style={{ color: isCorrect ? '#4caf50' : '#f44336', fontWeight: 600, margin: '8px 0' }}>
                    Your Answer: {q.options[userAnswer]} {isCorrect ? <CircleCheck /> : <CircleX />}
                  </p>
                  
                  {!isCorrect && (
                    <p style={{ color: '#4caf50', fontWeight: 600, margin: '8px 0' }}>
                      Correct Answer: {q.options[q.correctIndex]}
                    </p>
                  )}

                  <div className={styles["explanation-box"]}>
                    <p style={{ margin: 0 }}><Lightbulb /> {q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
            <button onClick={handleRegenerate} className={styles["quiz-restart-btn"]}>
              Re-generate This Quiz
            </button>
            <button onClick={handleRestart} className={styles["quiz-restart-btn"]}>
              Choose Another Topic
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizCard;
