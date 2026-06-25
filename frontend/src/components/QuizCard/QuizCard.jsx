import React, { useState } from "react";
import styles from "./QuizCard.module.css";
import axios from "axios";
import { API_BASE_URL } from "../../api";

const CATEGORIES = {
  "Linear Data Structures": [
    "Arrays", "Strings", "Singly Linked lists", "Doubly Linked lists", "Stack and Queues"
  ],
  "Non-Linear Data Structures": [
    "Trees", "Graphs", "Binary Trees"
  ],
  "Algorithms": [
    "Quick Sort", "Merge Sort", "Binary Search", "Recursion"
  ]
};

const QuizCard = () => {
  // Mode state: 'categories' | 'topics' | 'difficulty' | 'quiz' | 'loading'
  const [viewMode, setViewMode] = useState("categories");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
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
        topic: selectedTopic,
        difficulty,
      });
      setCurrentQuestions(response.data.questions);
      setViewMode("quiz");
      resetQuizState();
    } catch (error) {
      console.error("Error fetching questions:", error);
      if (error.response && error.response.status === 503) {
        alert(error.response.data.error || "The AI model is currently experiencing high demand. Please wait a moment and try again!");
      } else {
        alert("Error generating questions. Please try again.");
      }
      setViewMode("topics"); 
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

  const handleNext = async () => {
    if (currentIndex + 1 < currentQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setShowScoreHelper(true);
      if (isLoggedIn) {
        try {
          await axios.post(`${API_BASE_URL}/quiz/save-result`, {
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
    setViewMode("categories");
    setSelectedTopic(null);
    setSelectedCategory(null);
    resetQuizState();
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

  // 1. CATEGORY SELECTION View
  if (viewMode === "categories") {
    return (
      <div className={styles["quiz-container"]}>
        {!isLoggedIn && (
          <div style={{ textAlign: "center", marginBottom: "10px", color: "red", opacity: 0.7, fontStyle: "italic", fontSize: "1.1rem" }}>
            * Do login to save progress
          </div>
        )}
        <h2 className={styles["quiz-question"]} style={{ marginBottom: "20px" }}>
          Select a Category
        </h2>
        <div className={styles["difficulty-container"]} style={{ maxWidth: "600px", marginBottom: "30px" }}>
          {Object.keys(CATEGORIES).map(category => (
            <button
              key={category}
              className={`${styles["quiz-option"]} ${styles["difficulty-btn"]}`}
              onClick={() => handleCategorySelect(category)}
            >
              {category}
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

  // 2. TOPIC SELECTION View
  if (viewMode === "topics") {
    const categoryTopics = CATEGORIES[selectedCategory] || [];
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

  // 3. DIFFICULTY SELECTION View
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

  // 4. QUIZ TAKING View
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
          <p style={{ color: "var(--text)", opacity: 0.7, marginBottom: "20px" }}>
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
